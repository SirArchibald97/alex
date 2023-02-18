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

    client.guild_webhook = new WebhookClient({ url: "https://canary.discord.com/api/webhooks/1074779907042836480/fmbL2rFVQsMqoBODi7d50aXTNg8D3zbsG6wjLGh6-JfBLgte5CPmQySC4to6I2o2JEjx" });

    //console.log(await client.guilds.fetch());
}