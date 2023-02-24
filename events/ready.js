const { Collection, WebhookClient } = require("discord.js");
const fs = require("fs");

module.exports = async (client) => {
    console.log(`Client connected! [${client.user.tag}]`);

    const deploy = require("../deploy");
    await deploy(client);

    client.buttons = new Collection();
    const buttonFiles = fs.readdirSync(__dirname + "/../buttons/");
    for (let file of buttonFiles) {
        let button = require(__dirname + `/../buttons/${file}`);
        client.buttons.set(file.split(".")[0], button);
    }

    client.guild_webhook = new WebhookClient({ url: client.config.webhook });

    //console.log(await client.guilds.fetch());
}