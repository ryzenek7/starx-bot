const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499513009188376767";

  const rates = {
    BLIK_PAYPAL: 8,
    BLIK_CRYPTO: 8,
    BLIK_LTC: 8,
    PAYPAL_BLIK: 8,
    PAYPAL_CRYPTO: 8,
    PAYPAL_LTC: 8,
    CRYPTO_BLIK: 8,
    CRYPTO_PAYPAL: 8,
    CRYPTO_LTC: 8,
    LTC_BLIK: 8,
    LTC_PAYPAL: 8,
    LTC_CRYPTO: 8
  };

  const names = {
    BLIK: "💳︲BLIK",
    PAYPAL: "💰︲PAYPAL",
    CRYPTO: "🪙︲CRYPTO",
    LTC: "💠︲LTC"
  };

  client.once("ready", async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("💱 Wymień Hajs × Prowizje")
        .setDescription("📦 Wybierz metodę płatności");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("calc_from")
        .setPlaceholder("Wybierz metodę")
        .addOptions([
          { label: "BLIK", value: "BLIK" },
          { label: "PAYPAL", value: "PAYPAL" },
          { label: "CRYPTO", value: "CRYPTO" },
          { label: "LTC", value: "LTC" }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Kalkulator wysłany");
    } catch (err) {
      console.log("❌ Kalkulator ready:", err.message);
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (!interaction.isStringSelectMenu()) return;

      if (interaction.customId === "calc_from") {
        const from = interaction.values[0];

        const menu = new StringSelectMenuBuilder()
          .setCustomId(`calc_to_${from}`)
          .setPlaceholder("Na co wymienić?")
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

      if (interaction.customId.startsWith("calc_to_")) {
        const from = interaction.customId.replace("calc_to_", "");
        const to = interaction.values[0];

        const fee = rates[`${from}_${to}`] || 8;

        return interaction.reply({
          content: `${names[from]} ➜ ${names[to]}\n× Prowizja: ${fee.toFixed(1)}%`,
          ephemeral: true
        });
      }

    } catch (err) {
      console.log("❌ Kalkulator interaction:", err.message);
    }
  });
};
