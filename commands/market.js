const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('warframe market'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🔗 Arbitrations Guide Links & Support")
            .setColor(0xC00000)
            .setDescription(
                "**🎬 Video Hướng Dẫn Đăng Ký Warframe Market:**\n" +
                "[Youtube](https://www.youtube.com/watch?v=iK88s1mmIco)\n"
            );

        await interaction.reply({ embeds: [embed] });
    }
};
