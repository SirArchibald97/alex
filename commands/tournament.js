const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const { TournamentType, TournamentGame } = require("../types/tournaments.js");
const { getTournamentsByGuild, createTournament, joinTournament } = require("../api.js");

module.exports = {
    data: new SlashCommandBuilder().setName("tournament").setDescription("Create and manage your tournaments!")
        .addSubcommand(create => create.setName("create").setDescription("Create a new tournament!")
            .addStringOption(name => name.setName("name").setDescription("Enter a tournament name").setRequired(true).setMaxLength(50))
            .addStringOption(game => game.setName("game").setDescription("Select a game").setRequired(true)
                .addChoices(
                    { name: "Sky Battle", value: TournamentGame.SKY_BATTLE }, { name: "Battle Box", value: TournamentGame.BATTLE_BOX },
                    { name: "TGTTOS", value: TournamentGame.TGTTOS }, { name: "HITW", value: TournamentGame.HITW },
                    { name: "PKW Survivor", value: TournamentGame.PKW_SURVIVOR }
            ))
            .addStringOption(type => type.setName("type").setDescription("Select a tournament type").setRequired(true)
                .addChoices({ name: "Classic", value: TournamentType.CLASSIC }, { name: "Bracket", value: TournamentType.BRACKET })
            )
            .addIntegerOption(players => players.setName("players").setDescription("Enter the number of players").setRequired(true).setMinValue(2).setMaxValue(32))
        )
        .addSubcommand(manage => manage.setName("manage").setDescription("Manage an existing tournament"))
        .addSubcommand(finish => finish.setName("finish").setDescription("Finish an existing tournament"))
        .addSubcommand(join => join.setName("join").setDescription("Join an existing tournament")
            .addStringOption(code => code.setName("code").setDescription("Enter the tournament code").setRequired(true).setMinLength(6).setMaxLength(6))
        ),

    async execute(client, interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "create") {
            const tournaments = await getTournamentsByGuild(client, interaction.guild.id);
            if (tournaments.length > 3) return interaction.reply({ embeds: [
                    new EmbedBuilder().setDescription("You have reached the maximum number of active tournaments!").setColor("Red")
                ], ephemeral: true });

            const name = interaction.options.getString("name"), game = interaction.options.getString("game"), type = interaction.options.getString("type"), players = interaction.options.getInteger("players");
            const newId = uuidv4();
            const newCode = Math.floor(Math.random() * 90000) + 10000;

            await createTournament(client, newId, name, interaction.guild.id, type, players, newCode);
            await interaction.reply({ embeds: [
                new EmbedBuilder().setTitle("<:trophy:1133375484021981306> New tournament created!")
                    .setDescription("You can now use the `/tournament manage` command to manage your tournament!")
                    .setFields(
                        { name: "Details", value: `**Name**: \`${name}\`\n**Game**: \`${game}\`\n**Host**: <@${interaction.member.id}>\n**Type**: \`${type}\`\n**Players**: ${players}`, inline: true },
                    )
                    .setThumbnail(interaction.member.avatarURL())
                    .setColor("Red").setFooter({ text: `Tournament ID: ${newId}` }).setTimestamp()
            ] });

        } else if (subcommand === "manage") {
            

        } else if (subcommand === "finish") {


        } else if (subcommand === "join") {
            const code = interaction.options.getString("code");
            const tournaments = await getTournamentsByGuild(client, interaction.guild.id);
            const tournament = tournaments.find(t => t.code === code);
            if (!tournament) await interaction.reply({ embeds: [new EmbedBuilder().setDescription(":x: I couldn't find a tournament with that code!").setColor("Red")], ephemeral: true });
            
            await joinTournament(client, tournament.id, interaction.member.id);
        }
    }
}