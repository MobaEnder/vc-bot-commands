const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatgptskibidi")
    .setDescription("Hỏi bot – bot sẽ tìm trên Google và trả lời")
    .addStringOption(opt =>
      opt.setName("text")
        .setDescription("Câu hỏi của bạn")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString("text");
    const API_KEY = process.env.TAVILY_API_KEY;

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          query: query,
          search_depth: "basic",
          include_answer: true,
          max_results: 5
        })
      });

      const data = await res.json();

      let answer = data.answer;
      if (!answer || answer.length < 10) {
        answer = data.results?.[0]?.content || "❌ Không tìm được câu trả lời.";
      }

      if (answer.length > 1900) answer = answer.slice(0, 1900) + "...";

      await interaction.editReply({
        embeds: [{
          title: "🤖 Kết quả tìm kiếm",
          description: answer,
          footer: { text: "Nguồn: Tavily Search" },
          color: 0x00ff99
        }]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Lỗi khi tìm kiếm.");
    }
  }
};
