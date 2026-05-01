const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = async (client) => {
  const CHANNEL_ID = "1499513009188376767";

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
          { label: "BLIK", value: "BLIK", emoji: "💳" },
          { label: "PAYPAL", value: "PAYPAL", emoji: "💙" },
          { label: "CRYPTO", value: "CRYPTO", emoji: "🪙" },
          { label: "LTC", value: "LTC", emoji: "💠" }
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
💳︲BLIK ➜ 💙︲PAYPAL × **8.0%**
💳︲BLIK ➜ 🪙︲CRYPTO × **8.0%**
💳︲BLIK ➜ 💠︲LTC × **8.0%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    if (type === "PAYPAL") {
      desc = `
💙︲PAYPAL ➜ 💳︲BLIK × **7.0%**
💙︲PAYPAL ➜ 🪙︲CRYPTO × **7.0%**
💙︲PAYPAL ➜ 💠︲LTC × **7.5%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    if (type === "CRYPTO") {
      desc = `
🪙︲CRYPTO ➜ 💳︲BLIK × **3.5%**
🪙︲CRYPTO ➜ 💙︲PAYPAL × **3.5%**
🪙︲CRYPTO ➜ 💠︲LTC × **3.5%**

⚠️ Minimalna prowizja: **2 PLN**
`;
    }

    if (type === "LTC") {
      desc = `
💠︲LTC ➜ 💳︲BLIK × **3.5%**
💠︲LTC ➜ 💙︲PAYPAL × **4.0%**
💠︲LTC ➜ 🪙︲CRYPTO × **3.5%**

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
      ephemeral: true
    });
  });
};
