module.exports = async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        command.execute(client, interaction);
    } else if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        button(client, interaction);
    }
}