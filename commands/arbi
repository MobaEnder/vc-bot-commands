const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('arbi')
        .setDescription('Gửi link Arbitrations guide'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🔗 Arbitrations Guide Links & Support")
            .setColor(0xC00000)
            .setDescription(
                "**🎬 Video Support:**\n" +
                "[WISP](https://www.youtube.com/watch?v=AGKjrZv7cjk)\n" +
                "[VOLT](https://www.youtube.com/watch?v=MQPTVtw8Lhk)\n\n" +

                "**📚 Guide Tiếng Anh:**\n" +
                "[Arbi EL](https://docs.google.com/document/d/14yAA4rv82MVjDJKasm70oL_peegCHPQioDeMGdvf4DM/edit?tab=t.0)\n\n" +

                "**📚 Guide Tiếng Việt:**\n" +
                "[Arbi VI](https://docs.google.com/document/d/16o-ldk_ehgi2Yh1sLZ125DNt2Xg5PaBZo3mG0mkiP-E/edit?tab=t.0)\n"
            );

        await interaction.reply({ embeds: [embed] });
    }
};
