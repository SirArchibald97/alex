const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("halloffame").setDescription("View the MCC Hall of Fame for each game and statistic"),

    async execute(client, interaction) {
        const hofGames = {
            "GLOBAL_STATISTICS": "Global Statistics",
            "LEGACY_STATISTICS": "Legacy Statistics",
            "MG_ACE_RACE": "Ace Race",
            "MG_BATTLE_BOX": "Battle Box",
            "MG_BINGO_BUT_FAST": "Bingo But Fast",
            "MG_BUILD_MART": "Build Mart",
            "MG_DODGEBOLT": "Dodgebolt",
            "MG_GRID_RUNNERS": "Grid Runners",
            "MG_HOLE_IN_THE_WALL": "Hole In The Wall",
            "MG_MELTDOWN": "Meltdown",
            "MG_PARKOUR_TAG": "Parkour Tag",
            "MG_PARKOUR_WARRIOR": "Parkour Warrior",
            "MG_ROCKET_SPLEEF": "Rocket Spleef",
            "MG_SANDS_OF_TIME": "Sands Of Time",
            "MG_SKYBLOCKLE": "Skyblockle",
            "MG_SKY_BATTLE": "Sky Battle",
            "MG_SURVIVAL_GAMES": "Survival Games",
            "MG_TGTTOSAWAF": "TGTTOSAWAf",
        };

        const selectMenuOptions = Object.entries(hofGames).map(([value, label]) => ({ label, value }));
        const pages = {};

        const hofResponse = await fetch("https://api.mcchampionship.com/v1/halloffame");
        const { code, data } = await hofResponse.json();

        if (code !== 200) return interaction.reply({ embeds: [getErrorEmbed("NO_API_RES")], ephemeral: true });

        for (const [category, stats] of Object.entries(data)) {
            const hofEmbed = new EmbedBuilder()
                .setTitle(`🏆 MCC Hall of Fame: ${hofGames[category]}`)
                .setColor("Red")
                .setTimestamp()
                .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });

            for (const [stat, details] of Object.entries(stats)) {
                hofEmbed.addFields({ name: stat, value: `${details.player} -> ${details.value instanceof Number ? details.value.toLocaleString("en-US") : details.value}` });
            }

            pages[category] = hofEmbed;
        }

        const reply = await interaction.reply({ 
            embeds: [pages["GLOBAL_STATISTICS"]],
            components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("hof_page_selector").setPlaceholder("Select a page").addOptions(selectMenuOptions))],
            fetchReply: true
        });
        const filter = (int) => int.customId === "hof_page_selector" && int.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        collector.on("collect", async (int) => {
            await int.update({ embeds: [pages[int.values[0]]] });
        });
        collector.on("end", async (collected) => {
            await reply.edit({ 
                components: [
                    new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
                        .setCustomId("hof_page_selector_disable")
                        .setPlaceholder("Select a team")
                        .addOptions(teamSelectorItems)
                        .setDisabled(true)
                    )
                ]
            });
        });
    }
}