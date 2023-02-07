module.exports = {
    async getLatestEvent(conn) {
        return await executeSQL(conn, `SELECT * FROM latestEvent`);
    },

    async updateLatestEvent(conn, oldEvent, newId, newDate) {
        return await executeSQL(conn, `UPDATE latestEvent SET id = '${newId}' AND date = '${newDate}' WHERE id = '${oldEvent.id}'`);
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