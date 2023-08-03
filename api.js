const get = async (client, url) => {
    const res = await fetch(url, { method: "GET", headers: client.config.api_headers });
    return await res.json();
}

const post = async (client, url, data) => {
    const res = await fetch(url, { method: "POST", headers: client.config.api_headers, body: JSON.stringify(data) });
    return await res.json();
}

module.exports = {
    // Method to add a guild to the database on bot join
    // param client: the Discord client
    // param guildId: the guild ID
    addGuild: async function(client, guildId) {
        return await post(client, `${client.config.api_url}/alex/guilds/new`, { guild_id: guildId });
    },

    getGuild: async function(client, guildId) {
        return (await get(client, `${client.config.api_url}/alex/guilds/${guildId}`)).guild;
    },

    // Method to retrieve all badge data from the database
    // param client: the Discord client
    getBadges: async function(client) {
        return (await get(client, `${client.config.api_url}/alex/stats/badges`)).badges;
    },

    // Method to fetch all cosmetics that contain the query string
    // param client: the Discord client
    // param query: the query string
    getCosmetics: async function(client, query) {
        return (await get(client, `${client.config.api_url}/alex/cosmetics/${query}`)).cosmetics;
    },

    // Method to fetch NPC data of a given NPC
    // param client: the Discord client
    // param npcId: the NPC ID
    getNpc: async function(client, npcId) {
        return (await get(client, `${client.config.api_url}/alex/npcs/${npcId}`)).npc;
    },

    // Method to update the bee notification settings for a given guild
    // param client: the Discord client
    // param guildId: the guild ID
    // param toggled: whether or not the noficition is toggled
    // param channel: the channel ID to send the notification in
    // param role: the role ID to ping in the notification
    updateBeeSettings: async function(client, guildId, toggled, channel, role) {
        return await post(client, `${client.config.api_url}/alex/guilds/${guildId}/bee`, { toggled: toggled, channel: channel, role: role });
    },

    // Method to fetch all guilds with bee notifications toggled on
    // param client: the Discord client
    getBeeGuilds: async function(client) {
        return await get(client, `${client.config.api_url}/alex/guilds?filter=bee`);
    },

    // Method to update the update notification settings for a given guild
    // param client: the Discord client
    // param guildId: the guild ID
    // param toggled: whether or not the noficition is toggled
    // param channel: the channel ID to send the notification in
    // param role: the role ID to ping in the notification
    updateUpdateSettings: async function(client, guildId, toggled, channel, role) {
        return await post(client, `${client.config.api_url}/alex/guilds/${guildId}/updates`, { toggled: toggled, channel: channel, role: role });
    },

    // Method to fetch all guilds with update notifications toggled on
    // param client: the Discord client
    getUpdateGuilds: async function(client) {
        return await get(client, `${client.config.api_url}/alex/guilds?filter=updates`);
    },
}