const { EmbedBuilder } = require("discord.js");

module.exports = async (client, oldGuild) => {
    await client.guild_webhook.send({ embeds: [new EmbedBuilder().setDescription(`I joined a new server: ${oldGuild.name} \`(${oldGuild.id})\``).setColor("Green")] });
}