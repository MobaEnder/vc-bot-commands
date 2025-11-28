import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
} from "discord.js";

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";

import { Readable } from "stream";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

let connection = null;
let targetChannel = null;

// Silent audio stream để Discord KHÔNG kick bot
class Silence extends Readable {
  _read() {
    this.push(Buffer.from([0xF8, 0xFF, 0xFE])); // keepalive frame
  }
}

function playSilentAudio(conn) {
  const player = createAudioPlayer();
  const resource = createAudioResource(new Silence(), { inlineVolume: true });

  player.play(resource);
  conn.subscribe(player);

  console.log("🔇 Silent audio started");
}

// Hàm join + auto reconnect
async function connect(channel) {
  targetChannel = channel;

  console.log("🔌 Joining voice channel:", channel.id);

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: false,
  });

  // Khi kết nối xong thì phát silent audio
  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log("🟢 Voice ready");
    playSilentAudio(connection);
  });

  // Auto-reconnect cực mạnh
  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.log("⚠️ Disconnected → attempting recovery...");

    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);

      console.log("🔄 Recovered without full reconnect");
    } catch {
      console.log("❌ Failed to recover → destroying and rejoining");
      connection.destroy();
      setTimeout(() => connect(targetChannel), 1000);
    }
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log("💀 Connection destroyed → Rejoin in 2s");
    setTimeout(() => connect(targetChannel), 2000);
  });

  return connection;
}

// Slash command để join
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "join") {
    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.reply({
        content: "❌ Bạn phải vào room trước!",
        ephemeral: true,
      });
    }

    await interaction.reply("🔊 Bot đang join...");

    connect(channel);
  }
});

// Health check mỗi 30 giây
setInterval(() => {
  if (!connection) return;

  const state = connection.state.status;

  if (
    state === VoiceConnectionStatus.Disconnected ||
    state === VoiceConnectionStatus.Destroyed
  ) {
    console.log("🚨 Health check failed → force reconnect");
    connect(targetChannel);
  }
}, 30_000);

// Đăng nhập bot
client.login(process.env.TOKEN);
console.log("🤖 Bot starting...");
