const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getCosmetics, getNpc } = require("../api");

module.exports = {
    data: new SlashCommandBuilder().setName("cosmetics").setDescription("Missing a cosmetic? Check here to find out where to get it!")
        .addStringOption(option => option.setName("query").setDescription("Enter a search term").setRequired(true).setMinLength(3)),

    async execute(client, interaction) {
        const query = interaction.options.getString("query");
        const { success, cosmetics } = await getCosmetics(client, query);
        if (!success) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(":x: **Something went wrong doing that!** If the issue persists please contact @SirArchibald on Discord.")], ephemeral: true });

        if (cosmetics.length === 0) return await interaction.reply({ embeds: [
            new EmbedBuilder().setDescription(":x: Sorry, I couldn't find a cosmetic matching that search!").setColor("Red")
        ] });

        const embed = new EmbedBuilder()
            .setTitle(`👚 Cosmetics matching "${query}"`)
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });

        let desc = "";
        for (const cosmetic of cosmetics) {
            const npc = await getNpc(client, cosmetic.npc_id);
            if (npc.code !== 200) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(":x: **Something went wrong doing that!** If the issue persists please contact @SirArchibald on Discord.")], ephemeral: true });
            const priceString = cosmetic.coins === 0 ? `<:silver:1133826209864745082> \`${cosmetic.silver.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }\`` : `<:coin:1133375482595917906> \`${cosmetic.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\``;
            desc += `### ${cosmetic.name}\n**NPC:** ${npc.name}\n**Location:** ${npc.location}\n${priceString}   •   <:trophy:1133375484021981306> \`${cosmetic.trophies}\`\n`;
        }
        embed.setDescription(desc);

        await interaction.reply({ embeds: [embed] });
    }
}