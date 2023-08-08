const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, NewsChannel } = require("discord.js");
const { getGuild, updateGuild } = require("../api");

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
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ 
            embeds: [new EmbedBuilder().setDescription(":x: Only server administrators can use this command!").setColor("Red")]
        });

        const guild = await getGuild(client, interaction.guild.id);
        if (guild.code !== 200) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(":x: **Something went wrong doing that!** If the issue persists please contact @SirArchibald on Discord.")], ephemeral: true });

        const beeSettings = guild.guild.settings.bee;
        if (interaction.options.getSubcommand() === "toggle") {
            if (beeSettings.channel === '0' || beeSettings.role === '0') return interaction.reply({ 
                embeds: [new EmbedBuilder().setDescription(":x: You must set a channel and role before toggling the Bee reminder!").setColor("Red")],
                ephemeral: true
            });

            const newSetting = beeSettings.toggled === "false" ? true : false;
            let newSettings = guild.guild.settings;
            newSettings.bee.toggled = newSetting;
            await updateGuild(client, interaction.guild.id, newSettings);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`### Toggled Bee reminders ${newSetting ? "on" : "off"}!`)
                    .setColor(newSetting ? "Green" : "Red")
                ]
            });

        } else if (interaction.options.getSubcommand() === "setchannel") {
            const channel = interaction.options.getChannel("channel");
            let newSettings = guild.guild.settings;
            newSettings.bee.channel = channel.id;
            await updateGuild(client, interaction.guild.id, newSettings);
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`### Set Bee reminder channel to <#${channel.id}>`)
                        .setColor("Green")
                ] 
            });
        
        } else {
            const role = interaction.options.getRole("role");
            let newSettings = guild.guild.settings;
            newSettings.bee.role = role.id;
            await updateGuild(client, interaction.guild.id, newSettings);
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