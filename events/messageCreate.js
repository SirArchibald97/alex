module.exports = async (client, message) => {
    if (message.content.toLowerCase().includes("sirarchibald97 is a very very attractive person")) {
        try {
            await message.reply({ content: "based" });
        } catch (err) {
            console.log("Attempted to reply to message but failed!");
        }
    }
}