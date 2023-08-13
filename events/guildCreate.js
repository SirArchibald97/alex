const { EmbedBuilder } = require("discord.js");
const { addGuild, getGuild } = require("../api");

module.exports = async (client, newGuild) => {
    await client.guild_webhook.send({ embeds: [new EmbedBuilder().setDescription(`I joined a new server: ${newGuild.name} \`(${newGuild.id})\``).setColor("Green")] });
    
    const guild = await getGuild(client, newGuild.id);
    if (!guild) await addGuild(client, newGuild.id);
}