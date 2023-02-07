const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { getFormattedTeamName, getTeamColourResolvable, getTeamNames, getPlacementString } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder().setName("results").setDescription("View the scores and results of the last MCC event"),

    async execute(client, interaction) {
        await interaction.deferReply();
        
        // fetch event rundown data
        const rundownResponse = await fetch("https://api.mcchampionship.com/v1/rundown");
        const { code: rundownResCode, data: rundownData } = await rundownResponse.json();

        if (rundownResCode !== 200) return interaction.reply({ embeds: [getErrorEmbed("NO_API_RES")], ephemeral: true });

        const descString = "These are the results of the most recent MCC event. The data will update once the next event has finished!";
        const pages = {};
        const selectMenuOptions = [];
    
        // add data to embeds
        const dodgeboltEmbed = new EmbedBuilder().setTitle("🏆 MCC Results: Dodgebolt").setColor("Red").setTimestamp().setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });
        const dodgeboltTeams = Object.entries(rundownData.dodgeboltData).slice(0, -1);
        const dodgeboltWinner = dodgeboltTeams[0][1] > dodgeboltTeams[1][1] ? dodgeboltTeams[0] : dodgeboltTeams[1];
        const dodgeboltLoser = dodgeboltTeams[0][1] > dodgeboltTeams[1][1] ? dodgeboltTeams[1] : dodgeboltTeams[0];
        dodgeboltEmbed.setDescription(
            descString + 
            `\n\n**${getFormattedTeamName(dodgeboltTeams[0][0])}** vs **${getFormattedTeamName(dodgeboltTeams[1][0])}**` + 
            `\nWinner: **${getFormattedTeamName(dodgeboltWinner[0])}** (${dodgeboltWinner[1]} points to ${dodgeboltLoser[1]})`);
        pages["DODGEBOLT"] = dodgeboltEmbed;
        selectMenuOptions.push({ label: "Dodgebolt", value: "DODGEBOLT" });

        for (const team of getTeamNames()) {
            const teamEmbed = new EmbedBuilder().setTitle(`🏆 MCC Results: ${getFormattedTeamName(team)}`).setColor(getTeamColourResolvable(team)).setTimestamp().setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });

            const teamRes = await fetch(`https://api.mcchampionship.com/v1/participants/${team}`);
            const { code: teamsResCode, data: teamsData } = await teamRes.json();
            
            if (teamsResCode !== 200) return interaction.reply({ embeds: [getErrorEmbed("NO_API_RES")], ephemeral: true });

            teamEmbed.setDescription(`**${getFormattedTeamName(team)}** placed **${getPlacementString(rundownData.eventPlacements[team])}**, scoring **${rundownData.eventScores[team].toLocaleString("en-US")}** total points!`);
            for (const member of Object.values(teamsData)) {
                teamEmbed.addFields({ name: member.username, value: `${rundownData.individualScores[member.username].toLocaleString("en-US")} points` });
            }

            pages[team] = teamEmbed;
            selectMenuOptions.push({ label: getFormattedTeamName(team), value: team });
        }

        const reply = await interaction.editReply({ 
            embeds: [dodgeboltEmbed], 
            components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("result_page_selector").setPlaceholder("Select a page").addOptions(selectMenuOptions))],
            fetchReply: true 
        });
        const filter = i => i.customId === "result_page_selector" && i.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        collector.on("collect", async (int) => {
            await int.update({ embeds: [pages[int.values[0]]] });
        });
        collector.on("end", async (collected) => {
            await reply.edit({ 
                components: [
                    new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
                        .setCustomId("result_page_selector_disable")
                        .setPlaceholder("Select a page")
                        .addOptions(selectMenuOptions)
                        .setDisabled(true)
                    )
                ]
            });
        });
    }
}