const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499568863602540645";

  // ==========================
  // WYSYŁANIE PANELU
  // ==========================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel) {
        return console.log("❌ Nie znaleziono kanału.");
      }

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🌟 StarX Exchange » PROWIZJE")
        .setDescription("💸 Wybierz metodę płatności z menu poniżej.")
        .setFooter({ text: "© 2026 StarX Exchange" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("show_rates")
        .setPlaceholder("💰 Wybierz metodę")
        .addOptions([
          {
            label: "BLIK",
            value: "BLIK",
            emoji: "💳"
          },
          {
            label: "PAYPAL",
            value: "PAYPAL",
            emoji: "💙"
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

      console.log("✅ Panel prowizji wysłany.");
    } catch (err) {
      console.log("❌ Błąd przy wysyłaniu panelu:");
      console.log(err);
    }
  }

  // ==========================
  // READY
  // ==========================
  client.once(Events.ClientReady, async () => {
    console.log(`✅ Bot zalogowany jako ${client.user.tag}`);

    setTimeout(() => {
      sendPanel();
    }, 3000);
  });

  // ==========================
  // INTERAKCJE
  // ==========================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "show_rates") return;

    const selected = interaction.values[0];
    let desc = "";

    // ==========================
    // BLIK
    // ==========================
    if (selected === "BLIK") {
      desc = `
💳︲BLIK ➜ 💙︲PAYPAL × **8.0%**
💳︲BLIK ➜ 🪙︲CRYPTO × **8.0%**
💳︲BLIK ➜ 💠︲LTC × **8.0%**

⚠️ Minimalna prowizja przy wymianie z **BLIK** wynosi **2 PLN**
`;
    }

    // ==========================
    // PAYPAL
    // ==========================
    if (selected === "PAYPAL") {
      desc = `
💙︲PAYPAL ➜ 💳︲BLIK × **7.0%**
💙︲PAYPAL ➜ 🪙︲CRYPTO × **7.0%**
💙︲PAYPAL ➜ 💠︲LTC × **7.5%**

⚠️ Minimalna prowizja przy wymianie z **PAYPAL** wynosi **2 PLN**
`;
    }

    // ==========================
    // CRYPTO
    // ==========================
    if (selected === "CRYPTO") {
      desc = `
🪙︲CRYPTO ➜ 💙︲PAYPAL × **3.5%**
🪙︲CRYPTO ➜ 💳︲BLIK × **3.5%**
🪙︲CRYPTO ➜ 💠︲LTC × **3.5%**

⚠️ Minimalna prowizja przy wymianie z **CRYPTO** wynosi **2 PLN**
`;
    }

    // ==========================
    // LTC
    // ==========================
    if (selected === "LTC") {
      desc = `
💠︲LTC ➜ 💙︲PAYPAL × **4.0%**
💠︲LTC ➜ 💳︲BLIK × **3.5%**
💠︲LTC ➜ 🪙︲CRYPTO × **3.5%**

⚠️ Minimalna prowizja przy wymianie z **LTC** wynosi **2 PLN**
`;
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle(`🌟 ${selected} » PROWIZJE`)
      .setDescription(desc)
      .setFooter({ text: "StarX Exchange © 2026" });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  });
};
