const { Collection } = require("discord.js");
const fs = require("fs");
const { getLatestEvent, updateLatestEvent } = require("../db");

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
}