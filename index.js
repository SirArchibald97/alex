const { Client, GatewayIntentBits } = require("discord.js");
const { createConnection } = require("mysql");

const client = new Client({ intents: Object.values(GatewayIntentBits).filter(value => isNaN(value)) });
client.config = require("./config");
client.login(client.config.token);

const fs = require("fs");
const eventFiles = fs.readdirSync("./events/");
for (let file of eventFiles) {
    let event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
}

client.db = createConnection(client.config.db);