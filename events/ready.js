const { Collection, WebhookClient, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");
const { getBeeGuilds } = require("../api");

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

    cron.schedule("0 10 * * *", async () => {
        const { guilds } = await getBeeGuilds(client);
        if (!guilds) return;

        for (const beeSettings of guilds) {
            const guild = await client.guilds.fetch(beeSettings.guild_id);
            const channel = await guild.channels.fetch(beeSettings.channel);
            await channel.send({
                content: beeSettings.role !== 0 ? `<@&${beeSettings.role}>` : "",
                embeds: [new EmbedBuilder().setDescription("## DAILY BEE REMINDER!").setColor("Yellow").setImage("https://imgur.com/LGEEQkV.gif")]
            });
        }
    }, { timezone: "Etc/UTC" });
}