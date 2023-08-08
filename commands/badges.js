const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { getBadges } = require("../api");

module.exports = {
    data: new SlashCommandBuilder().setName("badges").setDescription("View the hidden badges for each game!")
        .addStringOption(game => game.setName("game").setDescription("Select a game").setRequired(false)
            .addChoices(
                { name: "Hole in the Wall", value: "HITW" },
                { name: "TGTTOS", value: "TGTTOS" },
                { name: "Battle Box", value: "BB" },
                { name: "Sky Battle", value: "SKB" },
            )
        ),

    async execute(client, interaction) {
        const game = interaction.options.getString("game");
        const badges = await getBadges(client);
        if (badges.code !== 200) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(":x: **Something went wrong doing that!** If the issue persists please contact @SirArchibald on Discord.")], ephemeral: true });

        const badgeData = [[], [], [], []]; // HITW, TGTTOS, BB, SKB
        const gameIndex = { "HITW": 0, "TGTTOS": 1, "BB": 2, "SKB": 3 };
        for (const badge of badges.badges) {
            badgeData[gameIndex[badge.game]].push(badge);
        }

        const embeds = [];
        for (const gameBadges of badgeData) {
            const gameData = this.gameData[gameBadges[0].game];
            const embed = new EmbedBuilder()
                .setTitle(gameData.emoji + " " + gameData.name + " Hidden Badges!")
                .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() })
                .setColor("Red")
                .setTimestamp()

            let desc = "";
            for (const badge of gameBadges) {
                desc += `### ${badge.name}\n\`${badge.description}\`\n`;
            }
            embed.setDescription(desc);
            embeds.push(embed);
        }

        const gameSelectMenu = new StringSelectMenuBuilder().setCustomId("badge-game-selector").setPlaceholder("Select a game").addOptions(
            { label: "Hole in the Wall", value: "HITW", emoji: "1133144799642386553" },
            { label: "TGTTOS", value: "TGTTOS", emoji: "1133144802922340374" },
            { label: "Battle Box", value: "BB", emoji: "1133144797436203038" },
            { label: "Sky Battle", value: "SKB", emoji: "1133144801320128552" }
        );
        const reply = await interaction.reply({
            embeds: [game ? embeds[gameIndex[game]] : embeds[0]],
            components: [new ActionRowBuilder().addComponents(gameSelectMenu)],
            fetchReply: true
        });

        const filter = (int) => int.customId === "badge-game-selector" && int.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        collector.on("collect", async (int) => {
            await int.update({ embeds: [embeds[gameIndex[int.values[0]]]] });
        });
        collector.on("end", async (collected) => {
            await reply.edit({ components: [new ActionRowBuilder().addComponents(StringSelectMenuBuilder.from(gameSelectMenu).setDisabled(true))] });
        });
    },

    gameData: {
        "HITW": {
            name: "Hole in the Wall",
            emoji: "<:hitw:1133144799642386553>"
        },
        "TGTTOS": {
            name: "TGTTOS",
            emoji: "<:tgttos:1133144802922340374>"
        },
        "BB": {
            name: "Battle Box",
            emoji: "<:bb:1133144797436203038>"
        },
        "SKB": {
            name: "Sky Battle",
            emoji: "<:skb:1133144801320128552>"
        }
    }
}