const executeSQL = async (conn, sql) => {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, result) => {
            if (err) reject(err);
            resolve(result?.length === 0 ? [] : result);
        });
    });
}

module.exports = {
    // Method to add a guild to the database on bot join
    // param conn: the connection to the database
    // param guildId: the guild ID
    addGuild: async function(conn, guildId) {
        return await executeSQL(conn, `INSERT INTO bee_notifs (guild_id, channel, role) VALUES ('${guildId}', '0', '0')`);
    },

    // Method to retrieve all badge data from the database
    // param conn: the connection to the database
    getBadges: async function(conn) {
        return await executeSQL(conn, `SELECT * FROM badges`);
    },

    // Method to fetch all cosmetics that contain the query string
    // param conn: the connection to the database
    // param query: the query string
    getCosmetics: async function(conn, query) {
        return await executeSQL(conn, `SELECT * FROM cosmetics WHERE LOWER(name) LIKE '%${query.toLowerCase()}%'`);
    },

    // Method to fetch NPC data of a given NPC
    // param conn: the connection to the database
    // param npcId: the NPC ID
    getNpc: async function(conn, npcId) {
        return (await executeSQL(conn, `SELECT * FROM npcs WHERE npc_id = '${npcId}'`))[0];
    },

    // Method to fetch bee notification settings for a given guild
    // param conn: the connection to the database
    // param guildId: the guild ID
    getBeeSettings: async function(conn, guildId) {
        return (await executeSQL(conn, `SELECT * FROM bee_notifs WHERE guild_id = '${guildId}'`))[0];
    },

    // Method to update the bee notification settings for a given guild
    // param conn: the connection to the database
    // param guildId: the guild ID
    // param toggled: whether or not the noficition is toggled
    // param channel: the channel ID to send the notification in
    // param role: the role ID to ping in the notification
    updateBeeSettings: async function(conn, guildId, toggled, channel, role) {
        return await executeSQL(conn, `UPDATE bee_notifs SET toggled = '${toggled}', channel = '${channel}', role = '${role}' WHERE guild_id = '${guildId}'`);
    },

    // Method to fetch all guilds with bee notifications toggled on
    // param conn: the connection to the database
    getBeeGuilds: async function(conn) {
        return await executeSQL(conn, `SELECT * FROM bee_notifs WHERE toggled = '1'`);
    },
}