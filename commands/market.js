const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Warframe Market'),

    async execute(interaction) {

        await interaction.reply(
            "**🎬 Video Hướng Dẫn Warframe Market:**\n" +
            "https://www.youtube.com/watch?v=g1AdX1j-8HQ"
        );

    }
};
