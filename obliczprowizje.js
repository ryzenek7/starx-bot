const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1499568863602540645";

  let selectedType = {};
  let selectedFrom = {};

  // =====================
  // CUSTOM EMOJI
  // =====================
  const EMOJI_BLIK = "<:blik:1499784231608389742>";
  const EMOJI_PAYPAL = "<:paypal:1499784258091483236>";
  const EMOJI_CRYPTO = "<:crypto:1499784635201224724>";
  const EMOJI_LTC = "<:ltc:1499784285211726014>";

  // =====================
  // PROWIZJE
  // =====================
  const rates = {
    "BLIK_PAYPAL": 8,
    "BLIK_CRYPTO": 8,
    "BLIK_LTC": 8,

    "PAYPAL_BLIK": 7,
    "PAYPAL_CRYPTO": 7,
    "PAYPAL_LTC": 7.5,

    "LTC_PAYPAL": 4,
    "LTC_BLIK": 3.5,
    "LTC_CRYPTO": 3.5,

    "CRYPTO_PAYPAL": 3.5,
    "CRYPTO_BLIK": 3.5,
    "CRYPTO_LTC": 3.5
  };

  function emoji(method) {
    if (method === "BLIK") return EMOJI_BLIK;
    if (method === "PAYPAL") return EMOJI_PAYPAL;
    if (method === "CRYPTO") return EMOJI_CRYPTO;
    if (method === "LTC") return EMOJI_LTC;
    return "💸";
  }

  // =====================
  // PANEL
  // =====================
  async function sendPanel() {
    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌟 StarX Exchange » OBLICZ PROWIZJĘ")
      .setDescription(
`💸 Oblicz ile dostaniesz lub ile musisz wpłacić.

📦 Kliknij menu poniżej.`
      )
      .setFooter({ text: "© 2026 StarX Exchange x Kalkulator" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("calc_type")
      .setPlaceholder("💸 Wybierz opcję")
      .addOptions([
        {
          label: "Jaką kwotę otrzymam?",
          value: "otrzymam"
        },
        {
          label: "Ile muszę wpłacić aby dostać X?",
          value: "wplace"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    console.log("✅ Kalkulator wysłany");
  }

  // =====================
  // READY
  // =====================
  client.on(Events.ClientReady, async () => {
    setTimeout(sendPanel, 3000);
  });

  // =====================
  // INTERACTIONS
  // =====================
  client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

      // typ
      if (interaction.customId === "calc_type") {

        selectedType[interaction.user.id] = interaction.values[0];

        const menu = new StringSelectMenuBuilder()
          .setCustomId("calc_from")
          .setPlaceholder("📤 Z jakiej metody?")
          .addOptions([
            {
              label: "BLIK",
              value: "BLIK",
              emoji: { id: "1499784231608389742", name: "blik" }
            },
            {
              label: "PAYPAL",
              value: "PAYPAL",
              emoji: { id: "1499784258091483236", name: "paypal" }
            },
            {
              label: "LTC",
              value: "LTC",
              emoji: { id: "1499784285211726014", name: "ltc" }
            },
            {
              label: "CRYPTO",
              value: "CRYPTO",
              emoji: { id: "1499784635201224724", name: "crypto" }
            }
          ]);

        return interaction.reply({
          content: "📤 Wybierz metodę Z:",
          components: [new ActionRowBuilder().addComponents(menu)],
          flags: 64
        });
      }

      // from
      if (interaction.customId === "calc_from") {

        selectedFrom[interaction.user.id] = interaction.values[0];

        const menu = new StringSelectMenuBuilder()
          .setCustomId("calc_to")
          .setPlaceholder("📥 Na jaką metodę?")
          .addOptions([
            {
              label: "BLIK",
              value: "BLIK",
              emoji: { id: "1499784231608389742", name: "blik" }
            },
            {
              label: "PAYPAL",
              value: "PAYPAL",
              emoji: { id: "1499784258091483236", name: "paypal" }
            },
            {
              label: "LTC",
              value: "LTC",
              emoji: { id: "1499784285211726014", name: "ltc" }
            },
            {
              label: "CRYPTO",
              value: "CRYPTO",
              emoji: { id: "1499784635201224724", name: "crypto" }
            }
          ]);

        return interaction.update({
          content: "📥 Wybierz metodę NA:",
          components: [new ActionRowBuilder().addComponents(menu)]
        });
      }

      // to
      if (interaction.customId === "calc_to") {

        const modal = new ModalBuilder()
          .setCustomId(`calc_modal_${interaction.values[0]}`)
          .setTitle("🌟 StarX Exchange");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("kwota")
              .setLabel("Podaj kwotę")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }
    }

    // =====================
    // MODAL
    // =====================
    if (interaction.isModalSubmit()) {

      if (!interaction.customId.startsWith("calc_modal_")) return;

      const to = interaction.customId.replace("calc_modal_", "");
      const from = selectedFrom[interaction.user.id];
      const type = selectedType[interaction.user.id];

      const key = `${from}_${to}`;

      if (!rates[key]) {
        return interaction.reply({
          content: "❌ Nie można wymienić tej metody.",
          flags: 64
        });
      }

      const percent = rates[key];

      const kwota = parseFloat(
        interaction.fields.getTextInputValue("kwota").replace(",", ".")
      );

      let wynik = 0;

      if (type === "otrzymam") {
        wynik = kwota - (kwota * percent / 100);
      } else {
        wynik = kwota / (1 - percent / 100);
      }

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🌟 StarX Exchange » WYNIK")
        .setDescription(
`${emoji(from)} **Z:** ${from}
${emoji(to)} **Na:** ${to}

💸 **Prowizja:** ${percent}%

💰 **Wynik:** ${wynik.toFixed(2)} zł`
        )
        .setFooter({ text: "© 2026 StarX Exchange x Kalkulator" });

      await interaction.reply({
        embeds: [embed],
        flags: 64
      });
    }

  });

};
