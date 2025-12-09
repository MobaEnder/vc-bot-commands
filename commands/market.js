const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('warframe market'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🔗 Warframe Market Guide")
            .setColor(0xC00000)
            .setDescription(
                "**🎬 Video Hướng Dẫn Đăng Ký Warframe Market:**\n" +
                "[YouTube](https://www.youtube.com/watch?v=iK88s1mmIco)\n"
            )
            .setImage("https://img.youtube.com/vi/iK88s1mmIco/maxresdefault.jpg"); // preview video

        await interaction.reply({ embeds: [embed] });
    }
};
