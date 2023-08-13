const { Collection, WebhookClient, EmbedBuilder, ActivityType } = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");

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
        console.log("Sending bee reminders...");

        const { getGuilds } = require("../api");
        const guilds = await getGuilds(client);
        const filteredGuilds = guilds.filter(g => g.settings.bee.toggled === "true");
        if (!filteredGuilds) return;

        for (const { guildId, settings } of filteredGuilds) {
            if (settings.bee.channel === "0") return;
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(settings.bee.channel);
            await channel.send({
                content: settings.bee.role !== "0" ? `<@&${settings.bee.role}>` : "",
                embeds: [new EmbedBuilder().setDescription("## DAILY BEE REMINDER!").setColor("Yellow").setImage("https://imgur.com/LGEEQkV.gif")]
            });
        }
    }, { timezone: "Etc/UTC" });

    
    const prescences = [
        "Sky Battle", "Battle Box", "Dodgebolt", "Hole in the Wall", "Parkour Tag", "Rocket Spleef Rush", "Ace Race", 
        "Parkour Warrior", "Buildmart", "Sands of Time", "Survival Games", "Gridrunners", "TGTTOS", "Meltdown"
    ];
    await client.user.setActivity({ name: prescences[Math.floor(Math.random() * prescences.length - 1) + 1], type: ActivityType.Playing, url: "https://alex.sirarchibald.dev" });
    setInterval(async () => {
        await client.user.setActivity({ name: prescences[Math.floor(Math.random() * prescences.length - 1) + 1], type: ActivityType.Playing, url: "https://alex.sirarchibald.dev" });
    }, 60_000 * 5);
}