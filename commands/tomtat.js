const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tomtat')
    .setDescription('Tóm tắt 100 tin nhắn mới nhất trong channel bằng AI')
    .addStringOption(opt =>
      opt.setName('channel_id')
        .setDescription('ID channel cần tóm tắt')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const channelId = interaction.options.getString('channel_id');
      const channel = await interaction.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        return interaction.editReply('❌ Channel ID không hợp lệ hoặc không phải text channel.');
      }

      const messages = await channel.messages.fetch({ limit: 100 });

      if (!messages.size) {
        return interaction.editReply('❌ Channel này chưa có tin nhắn.');
      }

      const text = messages
        .reverse()
        .map(m => `${m.author.username}: ${m.content}`)
        .join('\n');

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Hãy tóm tắt ngắn gọn đoạn hội thoại Discord sau bằng tiếng Việt:\n\n${text}`
      );

      await interaction.editReply(result.response.text());

    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Có lỗi khi xử lý yêu cầu.');
    }
  }
};
