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

    // KROK 1
    if (interaction.isStringSelectMenu()) {

      // typ
      if (interaction.customId === "calc_type") {

        selectedType[interaction.user.id] = interaction.values[0];

        const menu = new StringSelectMenuBuilder()
          .setCustomId("calc_from")
          .setPlaceholder("📤 Z jakiej metody?")
          .addOptions([
            { label: "BLIK", value: "BLIK" },
            { label: "PAYPAL", value: "PAYPAL" },
            { label: "LTC", value: "LTC" },
            { label: "CRYPTO", value: "CRYPTO" }
          ]);

        return interaction.reply({
          content: "📤 Wybierz metodę Z:",
          components: [new ActionRowBuilder().addComponents(menu)],
          ephemeral: true
        });
      }

      // from
      if (interaction.customId === "calc_from") {

        selectedFrom[interaction.user.id] = interaction.values[0];

        const menu = new StringSelectMenuBuilder()
          .setCustomId("calc_to")
          .setPlaceholder("📥 Na jaką metodę?")
          .addOptions([
            { label: "BLIK", value: "BLIK" },
            { label: "PAYPAL", value: "PAYPAL" },
            { label: "LTC", value: "LTC" },
            { label: "CRYPTO", value: "CRYPTO" }
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

    // MODAL
    if (interaction.isModalSubmit()) {

      if (!interaction.customId.startsWith("calc_modal_")) return;

      const to = interaction.customId.replace("calc_modal_", "");
      const from = selectedFrom[interaction.user.id];
      const type = selectedType[interaction.user.id];

      const key = `${from}_${to}`;

      if (!rates[key]) {
        return interaction.reply({
          content: "❌ Nie można wymienić tej metody.",
          ephemeral: true
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
`📤 Z: **${from}**
📥 Na: **${to}**

💸 Prowizja: **${percent}%**

💰 Wynik: **${wynik.toFixed(2)} zł**`
        )
        .setFooter({ text: "© 2026 StarX Exchange x Kalkulator" });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

  });

};