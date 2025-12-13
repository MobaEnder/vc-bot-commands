const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('syndicates')
        .setDescription('Warframe syndicates video'),

    async execute(interaction) {

        await interaction.reply(
            "**🎬 Video Syndicates:**\n" +
            "https://www.youtube.com/watch?v=6IfN1evlles"
        );

    }
};
