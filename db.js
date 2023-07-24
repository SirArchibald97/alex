module.exports = {
    addGuild: async function(conn, guildId) {
        return await executeSQL(conn, `INSERT INTO guilds (guild_id) VALUES ('${guildId}')`);
    },

    getServerSettings: async function(conn, guildId) {
        return await executeSQL(conn, `SELECT * FROM server_settings WHERE guild_id = '${guildId}'`);
    },

    updateServerSetting: async function(conn, guildId, setting, value) {
        return await executeSQL(conn, `UPDATE server_settings SET ${setting} = '${value}' WHERE guild_id = '${guildId}'`);
    },

    getBadges: async function(conn) {
        return await executeSQL(conn, `SELECT * FROM badges`);
    }
}

const executeSQL = async (conn, sql) => {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, result) => {
            if (err) reject(err);
            resolve(result.length === 0 ? [] : result);
        });
    });
}