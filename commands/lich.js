const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lich')
        .setDescription('Gửi link Kuva Lich / kênh Discord liên quan'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🔗 Kuva Lich – Link & Hướng Dẫn")
            .setColor(0xC00000)
            .setDescription(
                "**Wiki Kuva Lich:**\n" +
                "[Nhấn vào đây](https://warframe.fandom.com/wiki/Kuva_Lich)\n\n" +
                "**Kênh thảo luận trên Discord:**\n" +
                "[Vào kênh tại đây](https://discord.com/channels/1240686737332768862/1401272735530877008)"
            );

        await interaction.reply({ embeds: [embed] });
    }
};
