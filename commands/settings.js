const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ButtonStyle } = require("discord.js");
const { getGuild, updateGuild } = require("../api");

module.exports = {
    data: new SlashCommandBuilder().setName("settings").setDescription("Customise Alex's settings for your server!")
        .addSubcommand(bee => bee.setName("bee").setDescription("Modify settings for the daily Bee reminder!"))
        .addSubcommand(updates => updates.setName("updates").setDescription("Modify settings for the update notifications!")),

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ 
            embeds: [new EmbedBuilder().setDescription(":x: Only server administrators can use this command!").setColor("Red")]
        });

        const currentSettings = (await getGuild(client, interaction.guild.id)).settings;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "bee") {
            let newSettings = currentSettings;
            const embed = new EmbedBuilder().setTitle("Bee Settings").setColor("Red")
                .setDescription(
                    `Customise your server's daily Bee Freebie reminder!\n\n` +
                    `**Toggled**: \`${currentSettings.bee.toggled === "true" ? "true" : "false"}\`\n` +
                    `**Channel**: ${currentSettings.bee.channel === "0" ? "None" : `<#${currentSettings.bee.channel}>`}\n` +
                    `**Role**: ${currentSettings.bee.role === "0" ? "None" : `<@&${currentSettings.bee.role}>`}\n\n` +
                    `To edit more settings use the [Alex Dashboard](https://alex.sirarchibald.dev/dashboard/${interaction.guild.id})`
                );
            const toggleButton = new ButtonBuilder().setCustomId("bee-toggle").setLabel(`Toggle${currentSettings.bee.toggled === "true" ? " off" : " on"}`).setStyle(currentSettings.bee.toggled === "true" ? ButtonStyle.Success: ButtonStyle.Danger);
            const channelSelect = new ChannelSelectMenuBuilder().setCustomId("bee-channel").setPlaceholder("Select a channel").setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
            const roleSelect = new RoleSelectMenuBuilder().setCustomId("bee-role").setPlaceholder("Select a role");

            const reply = await interaction.reply({ 
                fetchReply: true,
                embeds: [embed], 
                components: [new ActionRowBuilder().addComponents(toggleButton), new ActionRowBuilder().addComponents(channelSelect), new ActionRowBuilder().addComponents(roleSelect)],
                ephemeral: true
            });

            const filter = i => i.member.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
            collector.on("collect", async int => {
                if (int.customId === "bee-toggle") {
                    newSettings.bee.toggled = newSettings.bee.toggled === "true" ? "false" : "true";
                    await int.update({ 
                        embeds: [EmbedBuilder.from(embed).setDescription(`Customise your server's daily Bee Freebie reminder!\n\n**Toggled**: \`${newSettings.bee.toggled}\`\n**Channel**: ${newSettings.bee.channel === "0" ? "None" : `<#${newSettings.bee.channel}>`}\n**Role**: ${newSettings.bee.role === "0" ? "None" : `<@&${newSettings.bee.role}>`}`)],
                        components: [
                            new ActionRowBuilder().addComponents(
                                ButtonBuilder.from(toggleButton)
                                    .setLabel(`Toggle${newSettings.bee.toggled === "true" ? " off" : " on"}`)
                                    .setStyle(newSettings.bee.toggled === "true" ? ButtonStyle.Success : ButtonStyle.Danger)), 
                            new ActionRowBuilder().addComponents(channelSelect), 
                            new ActionRowBuilder().addComponents(roleSelect)
                        ]
                    });

                } else if (int.customId === "bee-channel") {
                    newSettings.bee.channel = int.values[0];
                    await int.update({ 
                        embeds: [EmbedBuilder.from(embed).setDescription(`Customise your server's daily Bee Freebie reminder!\n\n**Toggled**: \`${newSettings.bee.toggled}\`\n**Channel**: ${newSettings.bee.channel === "0" ? "None" : `<#${newSettings.bee.channel}>`}\n**Role**: ${newSettings.bee.role === "0" ? "None" : `<@&${newSettings.bee.role}>`}`)],
                        components: [
                            new ActionRowBuilder().addComponents(
                                ButtonBuilder.from(toggleButton)
                                    .setLabel(`Toggle${newSettings.bee.toggled === "true" ? " off" : " on"}`)
                                    .setStyle(newSettings.bee.toggled === "true" ? ButtonStyle.Success : ButtonStyle.Danger)), 
                            new ActionRowBuilder().addComponents(channelSelect), 
                            new ActionRowBuilder().addComponents(roleSelect)
                        ]
                    });

                } else if (int.customId === "bee-role") {
                    newSettings.bee.role = int.values[0];
                    await int.update({ 
                        embeds: [EmbedBuilder.from(embed).setDescription(`Customise your server's daily Bee Freebie reminder!\n\n**Toggled**: \`${newSettings.bee.toggled}\`\n**Channel**: ${newSettings.bee.channel === "0" ? "None" : `<#${newSettings.bee.channel}`}>\n**Role**: ${newSettings.bee.role === "0" ? "None" : `<@&${newSettings.bee.role}>`}`)],
                        components: [
                            new ActionRowBuilder().addComponents(
                                ButtonBuilder.from(toggleButton)
                                    .setLabel(`Toggle${newSettings.bee.toggled === "true" ? " off" : " on"}`)
                                    .setStyle(newSettings.bee.toggled === "true" ? ButtonStyle.Success : ButtonStyle.Danger)), 
                            new ActionRowBuilder().addComponents(channelSelect), 
                            new ActionRowBuilder().addComponents(roleSelect)
                        ] 
                    });
                }
                await updateGuild(client, interaction.guild.id, newSettings);
            });
            
            collector.on("end", async collected => {
                await reply.edit({ components: [] });
            });

        } else if (subcommand === "updates") {
            const currentSettings = (await getGuild(client, interaction.guild.id)).settings.updates;
            let newSettings = currentSettings;

            const embed = new EmbedBuilder().setTitle("Bee Settings").setDescription(`Customise your server's update notifications!\n### Current Settings\n**Toggled**: \`${currentSettings.toggled}\`\n**Channel**: <#${currentSettings.channel}>\n**Role**: <@&${currentSettings.role}>`).setColor("Red");
            const toggleButton = new ButtonBuilder().setCustomId("updates-toggle").setLabel(`Toggle${newSettings.toggled === "true" ? " off" : " on"}`).setStyle(newSettings.toggled === "true" ? ButtonStyle.Success: ButtonStyle.Danger);
            const channelSelect = new ChannelSelectMenuBuilder().setCustomId("updates-channel").setPlaceholder("Select a channel").setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
            const roleSelect = new RoleSelectMenuBuilder().setCustomId("updates-role").setPlaceholder("Select a role");

            const reply = await interaction.reply({ fetchReply: true, 
                embeds: [embed], 
                components: [new ActionRowBuilder().addComponents(toggleButton), new ActionRowBuilder().addComponents(channelSelect), new ActionRowBuilder().addComponents(roleSelect)]
            });

            const filter = i => i.member.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
            collector.on("collect", async int => {
                if (int.customId === "updates-toggle") {
                    newSettings.toggled = newSettings.toggled === "true" ? "false" : "true";
                    await int.update({ 
                        embeds: [EmbedBuilder.from(embed).setDescription(`Customise your server's update notifications!\n### Current Settings\n**Toggled**: \`${newSettings.toggled}\`\n**Channel**: <#${newSettings.channel}>\n**Role**: <@&${newSettings.role}>`)],
                        components: [new ActionRowBuilder().addComponents(ButtonBuilder.from(toggleButton.setLabel(`Toggle${newSettings.toggled === "true" ? " off" : " on"}`).setStyle(newSettings.toggled === "true" ? ButtonStyle.Primary : ButtonStyle.Danger)), new ActionRowBuilder().addComponents(channelSelect)), new ActionRowBuilder().addComponents(roleSelect)] 
                    });

                } else if (int.customId === "updates-channel") {
                    newSettings.channel = int.values[0];
                    await int.update({ 
                        embeds: [EmbedBuilder.from(embed).setDescription(`Customise your server's update notifications!\n### Current Settings\n**Toggled**: \`${newSettings.toggled}\`\n**Channel**: <#${newSettings.channel}>\n**Role**: <@&${newSettings.role}>`)],
                        components: [new ActionRowBuilder().addComponents(ButtonBuilder.from(toggleButton.setLabel(`Toggle${newSettings.toggled === "true" ? " off" : " on"}`).setStyle(newSettings.toggled === "true" ? ButtonStyle.Primary : ButtonStyle.Danger)), new ActionRowBuilder().addComponents(channelSelect)), new ActionRowBuilder().addComponents(roleSelect)] 
                    });
                    
                } else if (int.customId === "updates-role") {
                    newSettings.role = int.values[0];
                    await int.update({ 
                        embeds: [EmbedBuilder.from(embed).setDescription(`Customise your server'supdate notifications!\n### Current Settings\n**Toggled**: \`${newSettings.toggled}\`\n**Channel**: <#${newSettings.channel}>\n**Role**: <@&${newSettings.role}>`)],
                        components: [new ActionRowBuilder().addComponents(ButtonBuilder.from(toggleButton.setLabel(`Toggle${newSettings.toggled === "true" ? " off" : " on"}`).setStyle(newSettings.toggled === "true" ? ButtonStyle.Primary : ButtonStyle.Danger)), new ActionRowBuilder().addComponents(channelSelect)), new ActionRowBuilder().addComponents(roleSelect)] 
                    });
                }
                await updateGuild(client, interaction.guild.id, newSettings);
            });
            
            collector.on("end", async collected => {
                await reply.edit({ components: [] });
            });
        }
    }
}