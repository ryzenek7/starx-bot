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
    BLIK_PAYPAL: 8.0,
    BLIK_CRYPTO: 8.0,
    BLIK_LTC: 8.0,

    PAYPAL_BLIK: 8.0,
    PAYPAL_CRYPTO: 8.0,
    PAYPAL_LTC: 8.0,

    CRYPTO_BLIK: 8.0,
    CRYPTO_PAYPAL: 8.0,
    CRYPTO_LTC: 8.0,

    LTC_BLIK: 8.0,
    LTC_PAYPAL: 8.0,
    LTC_CRYPTO: 8.0
  };

  // =========================
  // EMOJI (PODMIEŃ ID)
  // =========================
  const names = {
    BLIK: "<:blik:ID_BLIK>︲BLIK",
    PAYPAL: "<:PAYPAL:ID_PAYPAL>︲PAYPAL",
    CRYPTO: "<:crypto:ID_CRYPTO>︲CRYPTO",
    LTC: "<:ltc:ID_LTC>︲LTC"
  };

  const arrow = "➡️";

  // =========================
  // PANEL
  // =========================
  client.on("ready", async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      const messages = await channel.messages.fetch({ limit: 20 });

      const oldPanel = messages.find(
        msg =>
          msg.author.id === client.user.id &&
          msg.embeds.length > 0 &&
          msg.embeds[0].title === "💱 Wymień Hajs × Prowizje"
      );

      if (oldPanel) {
        console.log("✅ Panel kalkulatora już istnieje");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("💱 Wymień Hajs × Prowizje")
        .setDescription("📦 Wybierz metodę płatności poniżej");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("calc_from")
        .setPlaceholder("🏆 Wybierz metodę")
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

      console.log("✅ Panel kalkulatora wysłany");

    } catch (err) {
      console.log("❌ Błąd panelu:", err.message);
    }
  });

  // =========================
  // INTERACTIONS
  // =========================
  client.on(Events.InteractionCreate, async (interaction) => {
    try {

      if (!interaction.isStringSelectMenu()) return;

      // WYBÓR STARTOWY
      if (interaction.customId === "calc_from") {

        const from = interaction.values[0];

        const menu = new StringSelectMenuBuilder()
          .setCustomId(`calc_to_${from}`)
          .setPlaceholder("📦 Na co wymienić?")
          .addOptions(
            ["BLIK", "PAYPAL", "CRYPTO", "LTC"]
              .filter(x => x !== from)
              .map(x => ({
                label: x,
                value: x
              }))
          );

        const row = new ActionRowBuilder().addComponents(menu);

        return interaction.reply({
          content: "➡️ Wybierz metodę docelową",
          components: [row],
          ephemeral: true
        });
      }

      // WYNIK
      if (interaction.customId.startsWith("calc_to_")) {

        const from = interaction.customId.replace("calc_to_", "");
        const to = interaction.values[0];

        const fee = rates[`${from}_${to}`] || 8.0;

        return interaction.reply({
          content:
`${names[from]} ${arrow} ${names[to]}
× Prowizja: ${fee.toFixed(1)}%`,
          ephemeral: true
        });
      }

    } catch (err) {
      console.log("❌ Błąd interaction:", err.message);
    }
  });

};
