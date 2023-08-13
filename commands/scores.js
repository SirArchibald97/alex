const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("scores").setDescription("Manage the scores of players and teams in a tournament")
}