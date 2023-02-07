const { Collection, Routes } = require("discord.js");
const fs = require("fs");
const { REST } = require("@discordjs/rest");

module.exports = async (client) => {
    let commands = [];
    client.commands = new Collection();
    const commandFiles = fs.readdirSync("./commands/");
    for (let file of commandFiles) {
        let command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    const rest = new REST({ version: "10" }).setToken(client.config.token);
    await rest.put(Routes.applicationCommands(client.user.id, client.config.guildId), { body: commands });
}