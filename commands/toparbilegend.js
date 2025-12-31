const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toparbilegend')
        .setDescription('Top DPS Arbitrations Legend'),

    async execute(interaction) {

        // ====== SETTING TOP + PHẦN THƯỞNG ======
        const topList = [
            { id: '1451400932733616289', reward: '🎁 1 Skin Tự Chọn' },
            { id: '552876985676726275', reward: '🎁 x5 Oni Forma Bundel' },
            { id: '742738400330907741', reward: '🎁 x10 Forma Bundel' },
            { id: '784321064515141632', reward: '🎁 x5 Forma Bundel' },
            { id: '929228634563182622', reward: '🎁 x5 Forma Bundel' },
            { id: '715579253051359342', reward: '🎁 x5 Forma Bundel' },
            { id: '692226401398423592', reward: '🎁 x5 Forma Bundel' }
        ];

        let description = '';

        for (let i = 0; i < topList.length; i++) {
            const { id, reward } = topList[i];

            description += `**#${i + 1}** • <@${id}> • ${reward}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 TOP DPS ARBITRATIONS LEGEND')
            .setColor(0xFFD700)
            .setDescription(description)
            .setFooter({ text: 'DPS Arbitrations Ranking' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
