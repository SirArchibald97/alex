const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

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

        const embeds = [];
        for (const component of data.components) {
            const embed = new EmbedBuilder();
            if (component.children.length > 0) {
                embed.setTitle(`${this.SERVICE_EMOJIS[component.name]} ${component.name}`).setColor("Blurple")

                let services = "";
                for (const child of component.children) {
                    services += `Service: \`${child.description}\`\nStatus: \`${this.STATUS_TYPES[child.status]}\`\nLink: [${child.name}](https://status.mcchampionship.com/${child.id})\n\n`;
                }
                embed.setDescription(services);
                    
                if (component.activeMaintenances) {
                    const maintenance = component.activeMaintenances[0];

                    embed.addFields({
                        name: "Active Maintenances",
                        value: `${maintenance.name}: \`${this.MAINTENANCE_TYPES[maintenance.status]}\`\nTime: <t:${new Date(maintenance.start).getTime() / 1000}> - <t:${new Date(maintenance.end).getTime() / 1000}>`
                    });
                }

            } else {
                embed.setTitle(`${this.SERVICE_EMOJIS[component.name]} ${component.name}`)
                    .setDescription(`Service: \`${component.description}\`\nStatus: \`${this.STATUS_TYPES[component.status]}\`\nLink: [${component.name}](https://status.mcchampionship.com/${component.id})`)
                    .setColor(this.STATUS_COLOURS[component.status])

                if (component.activeMaintenances) {
                    const maintenance = component.activeMaintenances[0];

                    embed.addFields({
                        name: "Active Maintenances",
                        value: `${maintenance.name}: \`${this.MAINTENANCE_TYPES[maintenance.status]}\`\nTime: <t:${new Date(maintenance.start).getTime() / 1000}> - <t:${new Date(maintenance.end).getTime() / 1000}>`
                    });
                }
            }

            embeds.push(embed);
        }

        const selectMenu = new StringSelectMenuBuilder().setCustomId("service_selector").addOptions({ label: "🏝️ MCC Island", value: "0" }, { label: "🌐 Websites", value: "1" }, { label: "🖥️ Developer API", value: "2" });
        const reply = await interaction.editReply({ embeds: [embeds[Number(service)]], components: [new ActionRowBuilder().addComponents(selectMenu)], fetchReply: true });

        const filter = i => i.customId === "service_selector" && i.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        collector.on("collect", async (int) => {
            await int.update({ embeds: [embeds[Number(int.values[0])]] });
        });
        collector.on("end", async (collected) => {
            await reply.edit({ components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder.from(selectMenu).setDisabled(true))] });
        });
    },

    STATUS_TYPES: {
        "OPERATIONAL": "Operational",
        "PARTIALOUTAGE": "Partial Outage",
        "MINOROUTAGE": "Minor Outage",
        "MARJOROUTAGE": "Major Outage",
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

    SERVICE_EMOJIS: {
        "MCC Island Minecraft Server": "🏝️",
        "Websites": "🌐",
        "Developer API": "🖥️"
    }
}