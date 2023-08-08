const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("dashboard").setDescription("Get a link to your server's dashboard!"),

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ 
            embeds: [new EmbedBuilder().setDescription(":x: Only server administrators can use this command!").setColor("Red")]
        });

        const embed = new EmbedBuilder()
            .setDescription(`Click [here](https://alex.sirarchibald.dev/dashboard/${interaction.guild.id}) to view your server's dashboard!`)
            .setColor("Red")

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}