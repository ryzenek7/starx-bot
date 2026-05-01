const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Events
} = require("discord.js");

module.exports = (client) => {

    const CHANNEL_ID = "1499513009188376767";

    // =========================
    // PROWIZJE
    // =========================
    const rates = {
        "BLIK_PAYPAL": 8.0,
        "BLIK_CRYPTO": 8.0,
        "BLIK_LTC": 8.0,

        "PAYPAL_BLIK": 8.0,
        "PAYPAL_CRYPTO": 8.0,
        "PAYPAL_LTC": 8.0,

        "CRYPTO_BLIK": 8.0,
        "CRYPTO_PAYPAL": 8.0,
        "CRYPTO_LTC": 8.0,

        "LTC_BLIK": 8.0,
        "LTC_PAYPAL": 8.0,
        "LTC_CRYPTO": 8.0
    };

    // =========================
    // EMOJI + NAZWY
    // =========================
    const labels = {
        BLIK: ":blk:︲BLIK",
        PAYPAL: ":pp:︲PAYPAL",
        CRYPTO: ":crypto:︲CRYPTO",
        LTC: ":ltc:︲LTC"
    };

    const arrow = ":strzalka:";

    // =========================
    // PANEL
    // =========================
    client.once("ready", async () => {
        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("💱 Wymień Hajs × Prowizje")
            .setDescription("📦 Wybierz metodę płatności poniżej");

        const menu = new StringSelectMenuBuilder()
            .setCustomId("exchange_select")
            .setPlaceholder("Wybierz metodę...")
            .addOptions([
                {
                    label: "BLIK",
                    value: "BLIK",
                    emoji: "💳"
                },
                {
                    label: "PAYPAL",
                    value: "PAYPAL",
                    emoji: "💰"
                },
                {
                    label: "CRYPTO",
                    value: "CRYPTO",
                    emoji: "🪙"
                },
                {
                    label: "LTC",
                    value: "LTC",
                    emoji: "💠"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await channel.send({
            embeds: [embed],
            components: [row]
        });
    });

    // =========================
    // OBSŁUGA MENU
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "exchange_select") return;

        const from = interaction.values[0];

        const secondMenu = new StringSelectMenuBuilder()
            .setCustomId(`exchange_to_${from}`)
            .setPlaceholder("Na co chcesz wymienić?")
            .addOptions(
                ["BLIK", "PAYPAL", "CRYPTO", "LTC"]
                    .filter(x => x !== from)
                    .map(x => ({
                        label: x,
                        value: x
                    }))
            );

        const row = new ActionRowBuilder().addComponents(secondMenu);

        await interaction.reply({
            content: "➡️ Wybierz docelową metodę płatności:",
            components: [row],
            ephemeral: true
        });
    });

    // =========================
    // DRUGI WYBÓR
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId.startsWith("exchange_to_")) return;

        const from = interaction.customId.replace("exchange_to_", "");
        const to = interaction.values[0];

        const key = `${from}_${to}`;
        const fee = rates[key] || 8.0;

        await interaction.reply({
            content:
`${labels[from]} ${arrow} ${labels[to]}
× Prowizja: ${fee.toFixed(1)}%`,
            ephemeral: true
        });
    });

};
