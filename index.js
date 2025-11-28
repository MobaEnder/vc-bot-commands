const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  getVoiceConnection
} = require("@discordjs/voice");

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const OWNER_ID = process.env.OWNER_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Commands
const commands = [
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Bot join vào voice channel")
    .addStringOption(option =>
      option.setName("channel_id")
        .setDescription("ID voice channel")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Bot rời khỏi voice channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("kickbot")
    .setDescription("Kick bot để tránh bị crash")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

// Register slash commands
const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands
    });
    console.log("Slash commands đã được đăng ký!");
  } catch (err) {
    console.error(err);
  }
})();

const SILENCE = Buffer.from([0xF8, 0xFF, 0xFE]);

client.on("ready", () => {
  console.log(`Bot đã đăng nhập: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Owner check
  if (interaction.user.id !== OWNER_ID && !interaction.member.permissions.has("Administrator")) {
    return interaction.reply({ content: "Bạn không có quyền sử dụng lệnh này.", ephemeral: true });
  }

  const name = interaction.commandName;

  if (name === "join") {
    const channelId = interaction.options.getString("channel_id");
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== 2)
      return interaction.reply("ID không hợp lệ hoặc không phải voice channel.");

    const connection = joinVoiceChannel({
      channelId,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    setInterval(() => {
      const resource = createAudioResource(SILENCE, { inputType: StreamType.Opus });
      player.play(resource);
    }, 5000);

    connection.subscribe(player);

    return interaction.reply(`Bot đã join vào voice **${channel.name}**`);
  }

  if (name === "leave") {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection)
      return interaction.reply("Bot không ở trong voice nào.");

    connection.destroy();
    return interaction.reply("Bot đã rời voice channel!");
  }

  if (name === "kickbot") {
    await interaction.reply("Bot đang tự thoát để tránh crash...");
    process.exit(0);
  }
});

client.login(TOKEN);
