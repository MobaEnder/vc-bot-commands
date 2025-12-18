const fetch = require('node-fetch');

module.exports.getAuctions = async () => {
  const res = await fetch(
    "https://api.warframe.market/v1/auctions/search?type=riven&status=open"
  );
  const json = await res.json();
  return json.payload.auctions;
};
