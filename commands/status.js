const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { getErrorEmbed } = require("../utils");
const { ErrorType } = require("../types/errors");

module.exports = {
    data: new SlashCommandBuilder().setName("status").setDescription("View the statuses of MCC services")
        .addStringOption(service => service.setName("service").setDescription("Select a service").setRequired(false).addChoices(
            { name: "MCC Island", value: "0" },
            { name: "Websites", value: "1" },
            { name: "Developer API", value: "2" }
        )),

    async execute(client, interaction) {
        await interaction.deferReply();
        
        const service = interaction.options.getString("service") || "0";
        const status = await fetch(`https://status.mcchampionship.com/v2/components.json`);
        const data = await status.json();

        if (!data.components) return interaction.editReply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemeral: true });

        const embeds = [];
        for (const component of data.components) {
            const embed = new EmbedBuilder();
            if (component.children.length > 0) {
                embed.setTitle(`${this.SERVICE_EMOJIS[component.name]} ${component.name}`).setColor("Blurple")

                let services = "";
                for (const child of component.children) {
                    services += `**${child.name}**\nService: \`${child.description}\`\nStatus: \`${this.STATUS_TYPES[child.status]}\`\nLink: [${child.name}](https://status.mcchampionship.com)\n`;
                               
                    if (child.activeMaintenances) {
                        services += "**Active Maintenances:**\n";
                        for (const maintenance of child.activeMaintenances) {
                            services +=  `${maintenance.name}: \`${this.MAINTENANCE_TYPES[maintenance.status]}\`\nTime: <t:${new Date(maintenance.start).getTime() / 1000}> - <t:${new Date(maintenance.end).getTime() / 1000}>\n`;
                        }
                        services += "\n";
                    }
                    if (child.activeIncidents) {
                        services += "**Active Incidents:**\n";
                        for (const incident of child.activeIncidents) {
                            services += `${incident.name}: \`${this.INCIDENT_TYPES[incident.status]}\`\nTime: <t:${new Date(incident.createdAt).getTime() / 1000}>\n`
                        }
                        services += "\n";
                    }

                    services += "\n";
                }
                embed.setDescription(services);

            } else {
                embed.setTitle(`${this.SERVICE_EMOJIS[component.name]} ${component.name}`)
                    .setDescription(`Service: \`${component.description}\`\nStatus: \`${this.STATUS_TYPES[component.status]}\`\nLink: [${component.name}](https://status.mcchampionship.com)`)
                    .setColor(this.STATUS_COLOURS[component.status])

                if (component.activeMaintenances) {
                    let maintenances = "";
                    for (const maintenance of component.activeMaintenances) {
                        maintenances +=  `${maintenance.name}: \`${this.MAINTENANCE_TYPES[maintenance.status]}\`\nTime: <t:${new Date(maintenance.start).getTime() / 1000}> - <t:${new Date(maintenance.end).getTime() / 1000}>`;
                    }
                    embed.addFields({ name: "Active Maintenances", value: maintenances });
                }

                if (component.activeIncidents) {
                    let incidents = "";
                    for (const incident of component.activeIncidents) {
                        incidents += `${incident.name}: \`${this.INCIDENT_TYPES[incident.status]}\`\nImpact: \`${this.STATUS_TYPES[incident.impact]}\`\nTime: <t:${Math.round(new Date(incident.started).getTime() / 1000)}>\n[View on web](${incident.url})`
                    }
                    embed.addFields({ name: "Active Incidents", value: incidents });
                }
            }

            embeds.push(embed);
        }

        const selectMenu = new StringSelectMenuBuilder().setCustomId("service_selector").setPlaceholder("Select a service").addOptions({ label: "🏝️ MCC Island", value: "0" }, { label: "🌐 Websites", value: "1" }, { label: "🖥️ Developer API", value: "2" });
        const reply = await interaction.editReply({ embeds: [embeds[Number(service)]], components: [new ActionRowBuilder().addComponents(selectMenu)], fetchReply: true });

        const filter = i => i.customId === "service_selector" && i.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        collector.on("collect", async (int) => {
            await int.update({ embeds: [embeds[Number(int.values[0])]] });
        });
        collector.on("end", async (collected) => {
            await reply.edit({ components: [new ActionRowBuilder().addComponents(StringSelectMenuBuilder.from(selectMenu).setDisabled(true))] });
        });
    },

    STATUS_TYPES: {
        "OPERATIONAL": "Operational",
        "PARTIALOUTAGE": "Partial Outage",
        "MINOROUTAGE": "Minor Outage",
        "MAJOROUTAGE": "Major Outage",
    },

    STATUS_COLOURS: {
        "OPERATIONAL": "#00ff00",
        "PARTIALOUTAGE": "#ffff00",
        "MINOROUTAGE": "#ff9900",
        "MARJOROUTAGE": "#ff0000",
    },

    MAINTENANCE_TYPES: {
        "NOTSTARTEDYET": "Not Started Yet",
        "INPROGRESS": "In Progress",
        "COMPLETED": "Completed"
    },

    INCIDENT_TYPES: {
        "INVESTIGATING": "Investigating",
        "IDENTIFIED": "Identified",
        "MONITORING": "Monitoring",
        "RESOLVED": "Resolved"
    },

    SERVICE_EMOJIS: {
        "MCC Island Minecraft Server": "🏝️",
        "Websites": "🌐",
        "Developer API": "🖥️"
    }
}