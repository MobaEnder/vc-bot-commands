const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('relic_primed')
        .setDescription('Gửi link relic farm'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🔗 Relic, Ducat & Primed Mod Info")
            .setColor(0xC00000)
            .setDescription(
                "**🎬 Video:**\n" +
                "[Void Relic - Ducat - Primed Mod](https://www.youtube.com/watch?v=CIIpHWGajAo)\n\n" +

                "**📚 Wiki:**\n" +
                "[Void Relic](https://wiki.warframe.com/w/Void_Relic)\n\n" +

                "**📚 Wiki:**\n" +
                "[Relic Drop Locations](https://wiki.warframe.com/w/Void_Relic/DropLocationsByRelic)\n\n" +

                "**📚 Wiki:**\n" +
                "[Primed Mods](https://wiki.warframe.com/w/Primed_Mods)\n\n" +

                "**📚 Wiki:**\n" +
                "[Orokin Ducats](https://wiki.warframe.com/w/Orokin_Ducats#PC)\n\n" +

                "**🔎 Check Ducats:**\n" +
                "[Market Ducats](https://warframe.market/tools/ducats)\n"
            );

        await interaction.reply({ embeds: [embed] });
    }
};
