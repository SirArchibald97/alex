const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ConnectionService } = require("discord.js");
const { getFormattedTeamName, getTeamColourResolvable, getTeamNames, getPlacementString, cycleEmbeds, getTeamEmoji, getPrettyGameName } = require("../utils");
const { ErrorType } = require("../types/errors");

module.exports = {
    data: new SlashCommandBuilder().setName("results").setDescription("View scores and placements of the last MCC!")
        .addSubcommand(teams => teams.setName("teams").setDescription("View scores and team placements of the last MCC!"))
        .addSubcommand(players => players.setName("players").setDescription("View scores and individual placements of the last MCC!"))
        .addSubcommand(games => games.setName("games").setDescription("View scores and team placements of each gamemode from the last MCC!")),

    async execute(client, interaction) {
        await interaction.deferReply();

        const rundownResponse = await fetch("https://api.mcchampionship.com/v1/rundown");
        const { code, data } = await rundownResponse.json();
        if (code !== 200) return interaction.reply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "teams") {
            const embeds = [];
            const placements = Object.entries(data.eventPlacements).sort((a, b) => a[1] - b[1]), scores = data.eventScores, teams = data.creators;

            const embed = new EmbedBuilder().setTitle("<:trophy:1133375484021981306> Team Leaderboard").setColor("Red").setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp();
            let desc = "";
            let counter = 0;
            for (const [team, placement] of placements) {
                desc += `### ${getPlacementString(placement)} ${getTeamEmoji(team)} ${getFormattedTeamName(team)}: \`${scores[team].toLocaleString("en-US")}\`\n`;
                for (const player of teams[team]) desc += `**${player}** : \`${data.individualScores[player].toLocaleString("en-US")}\` points\n`;
                counter++;

                if (counter === 3) {
                    embeds.push(EmbedBuilder.from(embed).setDescription(desc));
                    desc = "";
                    counter = 0;
                }
            }
            if (desc.length > 0) embeds.push(EmbedBuilder.from(embed).setDescription(desc));

            await cycleEmbeds(interaction, embeds);

        } else if (subcommand === "players") {
            const embeds = [];
            const players = Object.entries(data.individualScores).sort((a, b) => b[1] - a[1]), teams = data.creators;

            const embed = new EmbedBuilder().setTitle("<:trophy:1133375484021981306> Player Leaderboard").setColor("Red").setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp();
            let desc = "";
            let counter = 0;
            let position = 0;
            for (const [player, score] of players) {
                const team = Object.entries(teams).find(([team, members]) => members.includes(player))[0];
                desc += `**${getPlacementString(position)} ${getTeamEmoji(team)} ${player}**: \`${score.toLocaleString("en-US")} points\`\n`
                counter++;
                position++;

                if (counter === 10) {
                    embeds.push(EmbedBuilder.from(embed).setDescription(desc));
                    desc = "";
                    counter = 0;
                }
            }
            if (desc.length > 0) embeds.push(EmbedBuilder.from(embed).setDescription(desc));

            await cycleEmbeds(interaction, embeds);

        } else {
            const embeds = [];

            const dodgebolt = data.dodgeboltData;
            let desc = [];
            for (const [team, score] of Object.entries(dodgebolt)) desc.push(`${getTeamEmoji(team)} ${getFormattedTeamName(team)}: \`${score}\``);
            embeds.push(new EmbedBuilder().setTitle("<:crown:1135963205328453663> Dodgebolt Results").setDescription("### " + desc.join(" vs. ")).setColor("Red").setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp());

            for (const game of Object.values(data.history)) {
                const teamPlacements = Object.entries(game.gamePlacements).sort((a, b) => a[1] - b[1]);
                let desc = `Game Multiplier: \`x${game.multiplier}\`\n\n`;
                for (const [team, placement] of teamPlacements) {
                    desc += `**${getPlacementString(placement)} ${getTeamEmoji(team)} ${getFormattedTeamName(team)}**: \`${game.gameScores[team].toLocaleString("en-US")}\`\n`;
                }

                embeds.push(new EmbedBuilder()
                    .setTitle(`<:crown:1135963205328453663> Game #${game.index + 1}: ${getPrettyGameName(game.game)}`)
                    .setDescription(desc)
                    .setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp().setColor("Red")
                );
            }

            const selectMenu = new StringSelectMenuBuilder().setCustomId("results-select").setPlaceholder("Select a game to view results").setMinValues(1).setMaxValues(1);
            let counter = 1;
            selectMenu.addOptions({ label: "Dodgebolt", value: "0" });
            for (const game of Object.values(data.history)) {
                selectMenu.addOptions({ label: getPrettyGameName(game.game), value: counter.toString() });
                counter++;
            }
            const reply = await interaction.editReply({ embeds: [embeds[0]], components: [new ActionRowBuilder().addComponents(selectMenu)], fetchReply: true });
            const filter = i => i.member.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
            collector.on("collect", async i => {
                await i.update({ embeds: [embeds[i.values[0]]] });
            });
            collector.on("end", async collected => {
                await reply.edit({ components: [new ActionRowBuilder().addComponents(StringSelectMenuBuilder.from(selectMenu).setDisabled(true))] });
            });
            
        }
    },
}