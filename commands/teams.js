const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { getFormattedTeamName, getTeamColourResolvable } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder().setName("teams").setDescription("View the MCC teams of the current event cycle")
        .addStringOption(team => team.setName("team").setDescription("The team to view").setRequired(false).addChoices(
            { name: "Red Rabbits", value: "RED" },
            { name: "Orange Ocelots", value: "ORANGE" },
            { name: "Yellow Yaks", value: "YELLOW" },
            { name: "Lime Llamas", value: "LIME" },
            { name: "Green Geckos", value: "GREEN" },
            { name: "Cyan Cyotes", value: "CYAN" },
            { name: "Aqua Axolotyls", value: "AQUA"},
            { name: "Blue Bats", value: "BLUE" },
            { name: "Purple Pandas", value: "PURPLE" },
            { name: "Pink Parrots", value: "PINK" },
            { name: "Spectators", value: "SPECTATORS" },
        )
    ),

    async execute(client, interaction) {
        await interaction.deferReply();

        const selectedTeam = interaction.options.getString("team") || "RED";

        // fetch event data
        const eventResponse = await fetch("https://api.mcchampionship.com/v1/event");
        const { code: eventResCode, data: eventData } = await eventResponse.json();
        // fetch event team data
        const teamResponse = await fetch("https://api.mcchampionship.com/v1/participants");
        const { code: teamsResCode, data: teamsData } = await teamResponse.json();

        if (eventResCode !== 200 || teamsResCode !== 200) return interaction.reply({ embeds: [getErrorEmbed("NO_API_RES")], ephemeral: true });

        // create a list of teams for the select menu
        const teamSelectorItems = [];

        // create embed for each team
        const teamPages = {};
        const eventDate = new Date(eventData.date);
        const eventTimestamp = eventDate.getTime();
        for (const [name, team] of Object.entries(teamsData)) {
            // create each embed and add to object 
            const teamEmbed = new EmbedBuilder()
                .setTitle(`MCC ${eventData.event}: Team ${getFormattedTeamName(name)}`)
                .setColor(getTeamColourResolvable(name))
                .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() })
                .setTimestamp()

            let desc = `MCC ${eventData.event} ${eventTimestamp < Date.now() ? "was" : "will be"} held on <t:${eventTimestamp / 1000}> (<t:${eventTimestamp / 1000}:R>)\n`;
            if (team.length !== 0) {
                for (const player of team) {
                    desc += `### ${player.username} : [${player.stream.includes("twitch.tv") ? "Twitch" : "YouTube"} Stream](${player.stream})\n`;
                }
            } else {
                desc += "No players have joined this team yet!";
            }
            teamEmbed.setDescription(desc);

            teamPages[name] = teamEmbed;

            // add team option to list
            teamSelectorItems.push({ label: getFormattedTeamName(name), value: name });
        }

        // send reply
        const reply = await interaction.editReply({ embeds: [teamPages[selectedTeam]], components: [new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId("team_page_selector").setPlaceholder("Select a team").addOptions(teamSelectorItems)])], fetchReply: true });

        // collect select menu interactions to update the embed
        const filter = int => int.customId === "team_page_selector" && int.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        collector.on("collect", async (int) => {
            const selectedPage = int.values[0];
            await int.update({ embeds: [teamPages[selectedPage]] });
        });
        // disable the select menu after 5 minutes
        collector.on("end", async (collected) => {
            await reply.edit({ 
                components: [
                    new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
                        .setCustomId("team_page_selector_disable")
                        .setPlaceholder("Select a team")
                        .addOptions(teamSelectorItems)
                        .setDisabled(true)
                    )
                ]
            });
        });
    }
}