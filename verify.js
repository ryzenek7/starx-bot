const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Events
} = require("discord.js");

module.exports = (client) => {

    // =========================
    // CONFIG
    // =========================
    const VERIFY_CHANNEL_ID = "1499725942313058344";
    const VERIFY_URL = "https://vaultcord.win/starxexchange";

    // EMOJI
    const YES = "<a:YES:1499784353012514917>";
    const LOCK = "🔒";
    const ROCKET = "🚀";
    const TROPHY = "🏆";

    // =========================
    // PANEL
    // =========================
    async function sendPanel() {
        try {
            const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setAuthor({
                    name: "StarX Exchange × Bot",
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle("🌟 StarX Exchange » WERYFIKACJA")
                .setDescription(
`${YES} **Witaj**, wybierz opcję poniżej aby przejść weryfikację.

${LOCK} Bezpieczne logowanie Discord OAuth2

${ROCKET} Uzyskaj pełny dostęp do serwera.`
                )
                .setImage("https://i.imgur.com/0h2yrK7_d.webp?maxwidth=760&fidelity=grand")
                .setFooter({
                    text: "© 2026 StarX Exchange × Verify"
                });

            const menu = new StringSelectMenuBuilder()
                .setCustomId("verify_select")
                .setPlaceholder(`${TROPHY} Wybierz metodę weryfikacji`)
                .addOptions([
                    {
                        label: "Zweryfikuj konto",
                        description: "Przejdź autoryzację Discord",
                        value: "verify",
                        emoji: "1499784353012514917"
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            console.log("✅ Verify panel wysłany");

        } catch (err) {
            console.log("❌ Verify panel error:", err);
        }
    }

    // =========================
    // READY
    // =========================
    client.once(Events.ClientReady, async () => {
        await sendPanel();
    });

    // =========================
    // MENU
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "verify_select") return;

        try {
            if (interaction.values[0] === "verify") {
                await interaction.reply({
                    content:
`${LOCK} Kliknij poniżej aby się zweryfikować:

${VERIFY_URL}`,
                    flags: 64
                });
            }

        } catch (err) {
            console.log("❌ Verify interaction error:", err);
        }
    });

};
