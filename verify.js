const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Events
} = require("discord.js");

module.exports = (client) => {

    const VERIFY_CHANNEL_ID = "1499725942313058344";
    const VERIFY_URL = "https://vaultcord.win/starxexchange";

    // EMOTKI
    const EMOJI_VERIFY = "<:yes:1499784353012514917>";
    const EMOJI_LOCK = "🔒";
    const EMOJI_ROCKET = "🚀";
    const EMOJI_STAR = "🌟";

    client.once(Events.ClientReady, async () => {
        try {
            const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setAuthor({
                    name: "StarX Exchange × Bot",
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle(`${EMOJI_STAR} StarX Exchange » WERYFIKACJA`)
                .setDescription(
`${EMOJI_VERIFY} **Witaj**, wybierz opcję poniżej aby przejść weryfikację.

${EMOJI_LOCK} Bezpieczne logowanie Discord OAuth2

${EMOJI_ROCKET} Uzyskaj pełny dostęp do serwera.`
                )
                .setImage("https://i.imgur.com/0h2yrK7_d.webp?maxwidth=760&fidelity=grand")
                .setFooter({
                    text: "© 2026 StarX Exchange × Verify"
                });

            const menu = new StringSelectMenuBuilder()
                .setCustomId("verify_select")
                .setPlaceholder("🏆 Wybierz metodę weryfikacji")
                .addOptions([
                    {
                        label: "Zweryfikuj konto",
                        description: "Przejdź autoryzację Discord",
                        value: "verify",
                        emoji: "✅"
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            console.log("✅ Panel verify wysłany");

        } catch (err) {
            console.log("❌ Verify error:", err);
        }
    });

    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "verify_select") return;

        try {
            if (interaction.values[0] === "verify") {
                await interaction.reply({
                    content:
`${EMOJI_LOCK} Kliknij poniżej aby się zweryfikować:

${VERIFY_URL}`,
                    flags: 64
                });
            }

        } catch (err) {
            console.log("❌ Verify interaction error:", err);
        }
    });

};
