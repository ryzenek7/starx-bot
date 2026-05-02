const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = async (client) => {
  const CHANNEL_ID = "1499513009188376767";

  // ==========================
  // CUSTOM EMOJI
  // ==========================
  const EMOJI_BLIK = "<:blik:1499784231608389742>";
  const EMOJI_PAYPAL = "<:paypal:1499784258091483236>";
  const EMOJI_CRYPTO = "<:crypto:1499784635201224724>";
  const EMOJI_LTC = "<:ltc:1499784285211726014>";

  // ==========================
  // FUNKCJA WYSYŁANIA PANELU
  // ==========================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel) {
        return console.log("❌ Nie znaleziono kanału #prowizje");
      }

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🌟 StarX Exchange » PROWIZJE")
        .setDescription("💸 Wybierz metodę płatności z menu poniżej.")
        .setFooter({ text: "© 2026 StarX Exchange x Prowizje" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("show_rates")
        .setPlaceholder("💰 Wybierz metodę")
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
            label: "CRYPTO",
            value: "CRYPTO",
            emoji: { id: "1499784635201224724", name: "crypto" }
          },
          {
            label: "LTC",
            value: "LTC",
            emoji: { id: "1499784285211726014", name: "ltc" }
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Panel prowizji wysłany na #prowizje");
    } catch (error) {
      console.log("❌ Błąd wysyłania panelu:");
      console.log(error);
    }
  }

  // ==========================
  // READY
  // ==========================
  if (client.isReady()) {
    sendPanel();
  } else {
    client.once(Events.ClientReady, async () => {
      sendPanel();
    });
  }

  // ==========================
  // MENU INTERACTION
  // ==========================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "show_rates") return;

    const type = interaction.values[0];
    let desc = "";

    if (type === "BLIK") {
      desc = `
${EMOJI_BLIK} ➜ ${EMOJI_PAYPAL} × **8.0%**
${EMOJI_BLIK} ➜ ${EMOJI_CRYPTO} × **8.0%**
${EMOJI_BLIK} ➜ ${EMOJI_LTC} × **8.0%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    if (type === "PAYPAL") {
      desc = `
${EMOJI_PAYPAL} ➜ ${EMOJI_BLIK} × **7.0%**
${EMOJI_PAYPAL} ➜ ${EMOJI_CRYPTO} × **7.0%**
${EMOJI_PAYPAL} ➜ ${EMOJI_LTC} × **7.5%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    if (type === "CRYPTO") {
      desc = `
${EMOJI_CRYPTO} ➜ ${EMOJI_BLIK} × **3.5%**
${EMOJI_CRYPTO} ➜ ${EMOJI_PAYPAL} × **3.5%**
${EMOJI_CRYPTO} ➜ ${EMOJI_LTC} × **3.5%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    if (type === "LTC") {
      desc = `
${EMOJI_LTC} ➜ ${EMOJI_BLIK} × **3.5%**
${EMOJI_LTC} ➜ ${EMOJI_PAYPAL} × **4.0%**
${EMOJI_LTC} ➜ ${EMOJI_CRYPTO} × **3.5%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle(`🌟 ${type} » PROWIZJE`)
      .setDescription(desc)
      .setFooter({ text: "StarX Exchange © 2026" });

    await interaction.reply({
      embeds: [embed],
      flags: 64
    });
  });
};
