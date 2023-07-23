const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("about").setDescription("View information about me!"),

    async execute(client, interaction) {
        const aboutEmbed = new EmbedBuilder()
            .setTitle("About MCC Stats")
            .setTitle("Hi, I'm Alex!")
            .setDescription("I'm an MCC utility bot developed by SirArchibald97! Using me you can view information about the MCC event, it's teams, and it's players! Take a look at some of my commands below:")
            .addFields(
                { name: "/about", value: "View information about me!" },
                { name: "/event", value: "View the current MCC event details" },
                { name: "/teams", value: "View the teams of the current MCC event" },
                { name: "/results", value: "View the scores and results of the last MCC event" },
                { name: "/halloffame", value: "View the MCC Hall of Fame for each game and statistic" },
                { name: "\u200b", value: "😄 Profile picture by [公式 Illust](https://pin.it/3D0q38M)\n👑 R.I.P [Technoblade](https://technoblade.com)" }
            )
            .setColor("Red")
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: `I am in no way affiliated with MCC or Noxcrew!`, iconURL: client.user.avatarURL() });

        await interaction.reply({ embeds: [aboutEmbed] });
    }
}