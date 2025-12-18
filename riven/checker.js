const { getAuctionsByWeapon } = require('./fetcher');
const { matchRiven } = require('./matcher');
const { notify } = require('./notifier');
const config = require('./config.json');

const seen = new Set();
let blockedCooldown = false;

module.exports = function startRivenChecker(client) {
  console.log("🔍 Riven checker started");

  async function loop() {
    if (blockedCooldown) return scheduleNext();

    try {
      const auctions = await getAuctionsByWeapon(config.weapon);

      for (const auction of auctions) {
        if (seen.has(auction.id)) continue;

        if (matchRiven(auction, config)) {
          await notify(client, auction);
          seen.add(auction.id);
        }
      }
    } catch (err) {
      console.error("Riven checker:", err.message);

      // 🛑 nếu bị block → nghỉ lâu hơn
      if (err.message.includes("Cloudflare")) {
        blockedCooldown = true;
        setTimeout(() => {
          blockedCooldown = false;
        }, 30_000); // nghỉ 30s
      }
    }

    scheduleNext();
  }

  function scheduleNext() {
    // ⏱ random delay 7–12s (rất quan trọng)
    const delay = 7000 + Math.random() * 5000;
    setTimeout(loop, delay);
  }

  // start sau khi bot online 5s
  setTimeout(loop, 5000);
};
