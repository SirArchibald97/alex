const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { findNpc, getCosmeticsByNpc } = require("../api");

module.exports = {
    data: new SlashCommandBuilder().setName("findvendor").setDescription("Find a hidden vendor by their name")
        .addStringOption(option => option.setName("query").setDescription("Enter a search term").setRequired(true).setMinLength(3)),
    
    async execute(client, interaction) {
        const query = interaction.options.getString("query");
        const { success, npcs } = await findNpc(client, query);
        if (!success) return interaction.reply({ embeds: [getErrorEmbed(ErrorType.NO_ALEX_RES)], ephemeral: true });

        if (npcs.length === 0) return await interaction.reply({ embeds: [
            new EmbedBuilder().setDescription(":x: Sorry, I couldn't find a vendor matching that search!").setColor("Red")
        ] });
        
        const embed = new EmbedBuilder()
            .setTitle(`👚 Vendors matching "${query}"`)
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });
        let desc = "";
        for (const npc of npcs) {
            desc += `### ${npc.name}\n**Location:** ${npc.location} (${npc.coords})${npc.hint ? `\n**Hint:** ${npc.hint}` : ""}\n**Sells:**\n`;
            const { cosmetics } = await getCosmeticsByNpc(client, npc.npc_id);
            for (const cosmetic of cosmetics) {
                desc += ` • ${cosmetic.name}\n`;
            }
        }
        await interaction.reply({ embeds: [embed.setDescription(desc)] });
    }
}