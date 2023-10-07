const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getErrorEmbed } = require("../utils");
const { ErrorType } = require("../types/errors");

module.exports = {
    data: new SlashCommandBuilder().setName("status").setDescription("View the current status of MCC Island!"),

    async execute(client, interaction) {        
        const status = await fetch(`https://status.mcchampionship.com/summary.json`);
        const data = await status.json();
        if (!data.page) return await interaction.reply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemera: true });
    
        const embed = new EmbedBuilder()
            .setTitle(`📊 MCC Island Status`)
            .setDescription(`### MCC Island is currently **${this.STATUS_TYPES[data.page.status]}**! Click [this link](${data.page.url}) for live updates.`)
            .setColor(this.STATUS_COLOURS[data.page.status])
            .setTimestamp()
            .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });

        if (data.activeIncidents) {
            if (data.activeIncidents.length > 0) {
                embed.setDescription(embed.description + "\n\n**Active Incidents**")
                for (const incident of data.activeIncidents) {
                    embed.addField(`🚨 ${incident.name}`, `**Status:** ${this.INCIDENT_TYPES[incident.status]}\n**Updates:** [status.mcchampionship.com](${incident.url}))\n**Started:** ${incident.started}`);
                }
            }
        }

        if (data.activeMaintenances) {
            if (data.activeMaintenances.length > 0) {
                embed.setDescription(embed.description + "\n\n**Active Maintenances**")
                for (const maintenance of data.activeMaintenances) {
                    embed.addField(`🔧 ${maintenance.name}`, `**Status:** ${this.MAINTENANCE_TYPES[maintenance.status]}\n**Updates:** [status.mcchampionship.com](${maintenance.url})\n**Started:** ${maintenance.start}`);
                }
            }
        }

        await interaction.reply({ embeds: [embed] });
    },

    STATUS_TYPES: {
        "UP": "online",
        "HASISSUES": "experiencing issues",
        "UNDERMAINTENANCE": "under maintenance"
    },

    STATUS_COLOURS: {
        "UP": "Green",
        "HASISSUES": "Orange",
        "UNDERMAINTENANCE": "Red"
    },

    INCIDENT_TYPES: {
        "INVESTIGATING": "Investigating",
        "IDENTIFIED": "Identified",
        "MONITORING": "Monitoring",
        "RESOLVED": "Resolved"
    },

    MAINTENANCE_TYPES: {
        "NOTSTARTEDYET": "Not Started Yet",
        "INPROGRESS": "In Progress",
        "COMPLETED": "Completed"
    },
}