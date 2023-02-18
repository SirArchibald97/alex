const { EmbedBuilder } = require("discord.js");

module.exports = async (client, newGuild) => {
    await client.guild_webhook.send({ embeds: [new EmbedBuilder().setDescription(`I joined a new server: ${newGuild.name} \`(${newGuild.id})\``).setColor("Green")] });
}