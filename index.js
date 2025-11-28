const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  PermissionFlagsBits 
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const { Readable } = require("stream");

// ==== Silent Stream ====
class Silence extends Readable {
  _read() {
    // Push a single OPUS silent frame and end the stream immediately.
    this.push(Buffer.from([0xF8, 0xFF, 0xFE]));
    this.push(null);
  }
}

// ===== Environment =====
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const OWNER_ID = process.env.OWNER_ID;

// ===== Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// In-memory map to track per-guild audio players/connections
const guildAudio = new Map();

// ===== Slash Commands =====
const commands = [
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Bot join vào voice channel (admin only)")
    .addStringOption(option =>
      option.setName("channel_id")
        .setDescription("ID voice channel")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Bot rời voice channel (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(cmd => cmd.toJSON());

// ==== Register Commands (guild-scoped) ====
const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    if (!CLIENT_ID || !GUILD_ID) {
      console.warn("CLIENT_ID or GUILD_ID not set. Skipping command registration.");
      return;
    }
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands
    });
    console.log("Slash commands đã được đăng ký!");
  } catch (err) {
    console.error("Lỗi đăng ký lệnh:", err);
  }
})();

// ==== Utilities ====
function createAndPlay(player) {
  try {
    const resource = createAudioResource(new Silence(), { inputType: StreamType.Opus });
    player.play(resource);
  } catch (e) {
    console.error("Lỗi createAndPlay:", e);
  }
}

// Try to ensure connection is ready
async function ensureReady(connection) {
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    return true;
  } catch {
    return false;
  }
}

// ==== Events =====
client.on("clientReady", () => {
  console.log(`Bot đã đăng nhập: ${client.user.tag}`);
});

// Interaction handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Permission check: OWNER_ID OR server Admin
  const isOwner = interaction.user.id === OWNER_ID;
  const isAdmin = interaction.member && interaction.member.permissions && interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  if (!isOwner && !isAdmin) {
    return interaction.reply({ content: "Bạn không có quyền sử dụng lệnh này.", flags:64 });
  }

  const name = interaction.commandName;

  if (name === "join") {
    const channelId = interaction.options.getString("channel_id");
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== 2) {
      return interaction.reply({ content: "ID không hợp lệ hoặc không phải voice channel.", ephemeral: true });
    }

    // If already tracking this guild, destroy previous connection cleanly first
    const existing = guildAudio.get(interaction.guild.id);
    if (existing && existing.connection) {
      try {
        existing.connection.destroy();
      } catch(e){}
      guildAudio.delete(interaction.guild.id);
    }

    const connection = joinVoiceChannel({
      channelId,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true
    });

    const player = createAudioPlayer();

    // When player becomes idle, replay silence to keep connection alive
    player.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        setTimeout(() => createAndPlay(player), 500);
      }
    });

    player.on("error", (err) => {
      console.error("Audio player error:", err);
      try { player.stop(true); } catch(e){}
      setTimeout(() => {
        try { createAndPlay(player); } catch(e){}
      }, 1000);
    });

    connection.subscribe(player);

    const ready = await ensureReady(connection);
    if (!ready) {
      connection.destroy();
      return interaction.reply({ content: "Không thể kết nối tới voice. Vui lòng thử lại.", ephemeral: true });
    }

    createAndPlay(player);

    connection.on("stateChange", (oldState, newState) => {
      const oldStatus = oldState.status;
      const newStatus = newState.status;
      console.log(`Connection state change: ${oldStatus} -> ${newStatus}`);

      if (newStatus === "disconnected") {
        setTimeout(async () => {
          try {
            const conn = getVoiceConnection(interaction.guild.id);
            if (!conn) {
              console.log("Attempting to rejoin voice to avoid timeout...");
              const reconnect = joinVoiceChannel({
                channelId,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: true
              });
              reconnect.subscribe(player);
            } else {
              console.log("Connection exists, skipping rejoin.");
            }
          } catch (e) {
            console.error("Reconnect attempt failed:", e);
          }
        }, 2500);
      }

      if (newStatus === "destroyed") {
        guildAudio.delete(interaction.guild.id);
      }
    });

    guildAudio.set(interaction.guild.id, {
      connection,
      player,
      channelId
    });

    return interaction.reply({ content: `Bot đã join và giữ room **${channel.name}** liên tục.`, ephemeral: false });
  }

  if (name === "leave") {
    const info = guildAudio.get(interaction.guild.id);
    if (!info || !info.connection) {
      return interaction.reply({ content: "Bot hiện không ở trong voice nào.", ephemeral: true });
    }

    try {
      info.connection.destroy();
    } catch (e) {
      console.error("Error destroying connection:", e);
    }
    guildAudio.delete(interaction.guild.id);
    return interaction.reply({ content: "Bot đã rời voice channel.", ephemeral: false });
  }
});

client.login(TOKEN);
