const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Events
} = require("discord.js");

module.exports = (client) => {

    const VERIFY_CHANNEL_ID = "1499725942313058344";
    const VERIFY_URL = "https://vaultcord.win/starxexchange";

    client.once(Events.ClientReady, async () => {

        const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor("#76ff03")
            .setAuthor({
                name: "StarX Exchange × Bot",
                iconURL: client.user.displayAvatarURL()
            })
            .setTitle("🌟 ! STARX EXCHANGE × WERYFIKACJA")
            .setDescription(`
> ✅ **Witaj**, wybierz opcję poniżej aby przejść weryfikację.

> 🔒 Bezpieczne logowanie Discord OAuth2

> 🚀 Uzyskaj pełny dostęp do serwera
            `)
            .setImage("https://i.imgur.com/5zjYMiw_d.webp?maxwidth=760&fidelity=grand")
            .setFooter({
                text: "© 2026 StarX Exchange × Weryfikacja"
            });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("verify_select")
            .setPlaceholder("🏆 Wybierz metodę weryfikacji")
            .addOptions([
                {
                    label: "Zweryfikuj konto",
                    description: "Przejdź autoryzację Discord",
                    value: "verify"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log("✅ Panel verify wysłany");
    });

    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "verify_select") return;

        if (interaction.values[0] === "verify") {
            await interaction.reply({
                content: `🔐 Kliknij aby się zweryfikować:\n${VERIFY_URL}`,
                ephemeral: true
            });
        }

    });

};
