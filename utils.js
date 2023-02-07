const { EmbedBuilder } = require("discord.js");

module.exports = {
    // get an array of raw team names in order
    getTeamNames: function() {
        return [
            "RED", "ORANGE", "YELLOW", "LIME", "GREEN", "CYAN", "AQUA", "BLUE", "PURPLE", "PINK"
        ];
    },
    
    // get a pretty team name from a raw team name
    getFormattedTeamName: function(teamName) {
        const prettyNames = [
            "Red Rabbits", "Orange Ocelots", "Yellow Yaks", "Lime Llamas", "Green Geckos", "Cyan Coyotes", "Aqua Axolotyls", "Blue Bats", "Purple Panadas", "Pink Parrots", "Spectators", "None"
        ];
        const uglyNames = [
            "RED", "ORANGE", "YELLOW", "LIME", "GREEN", "CYAN", "AQUA", "BLUE", "PURPLE", "PINK", "SPECTATORS", "NONE"
        ];
        
        return prettyNames[uglyNames.indexOf(teamName)];
    },

    // get an rbg colour resolvable from a raw team name
    getTeamColourResolvable: function(teamName) {
        const colourResolvables = {
            "RED": [255, 85, 85],
            "ORANGE": [255, 170, 0],
            "YELLOW": [255, 255, 85],
            "LIME": [85, 255, 85],
            "GREEN": [0, 170, 0],
            "CYAN": [0, 170, 170],
            "AQUA": [85, 255, 255],
            "BLUE": [0, 0, 170],
            "PURPLE": [170, 0, 170],
            "PINK": [255, 85, 255],
            "SPECTATORS": [170, 170, 170],
            "NONE": [255, 255, 255]
        };
        return colourResolvables[teamName];
    },

    // get a placement string from a raw position
    getPlacementString: function(position) {
        const placementStrings = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
        return placementStrings[position - 1];
    },

    // custom error code embed
    getErrorEmbed: function(errorCode) {
        const errorMessages = {
            "NO_API_RES": "using the MCC API"
        }
        return new EmbedBuilder().setDescription(`**Sorry about this!** Something went wrong ${errorMessages[errorCode]}, please wait a bit and try again later!`).setColor("Red");
    }
}