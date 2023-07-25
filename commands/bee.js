const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getBeeSettings, updateBeeSettings } = require("../db");

module.exports = {
    data: new SlashCommandBuilder().setName("bee").setDescription("Set a channel for the daily Bee reminder!")
        .addSubcommand(toggle => toggle.setName("toggle").setDescription("Toggle the Bee reminder on or off!"))
        .addSubcommand(setchannel => setchannel.setName("setchannel").setDescription("Set a channel for the reminder to be sent in!")
            .addChannelOption(channel => channel.setName("channel").setDescription("Select a channel").setRequired(true))
        )
        .addSubcommand(setrole => setrole.setName("setrole").setDescription("Seta role for the reminder to ping!")
            .addRoleOption(role => role.setName("role").setDescription("Select a role").setRequired(true))
        ),

    async execute(client, interaction) {
        if (interaction.member.permissions.has("ADMINISTRATOR") === false) return interaction.reply({ 
            embeds: [new EmbedBuilder().setDescription(":x: Only server administrators can use this command!").setColor("Red")]
        });

        const beeSettings = await getBeeSettings(client.db, interaction.guild.id);

        if (interaction.options.getSubcommand() === "toggle") {
            if (beeSettings.channel === '0' || beeSettings.role === '0') return interaction.reply({ 
                embeds: [new EmbedBuilder().setDescription(":x: You must set a channel and role before toggling the Bee reminder!").setColor("Red")],
                ephemeral: true
            });

            const newSetting = beeSettings.toggled === 0 ? 1 : 0;
            await updateBeeSettings(client.db, interaction.guild.id, newSetting, beeSettings.channel, beeSettings.role);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`### Toggled Bee reminders ${newSetting === 1 ? "on" : "off"}!`)
                    .setColor(newSetting === 1 ? "Green" : "Red")
                ]
            });

        } else if (interaction.options.getSubcommand() === "setchannel") {
            const channel = interaction.options.getChannel("channel");
            await updateBeeSettings(client.db, interaction.guild.id, beeSettings.toggled, channel?.id || 0, beeSettings.role);
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`### Set Bee reminder channel to <#${channel.id}>`)
                        .setColor("Green")
                ] 
            });
        
        } else {
            const role = interaction.options.getRole("role");
            await updateBeeSettings(client.db, interaction.guild.id, beeSettings.toggled, beeSettings.channel, role?.id || 0);
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`### Set Bee reminder role to <@&${role.id}>`)
                        .setColor("Green")
                ] 
            });
        }
    }
}