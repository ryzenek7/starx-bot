const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499568863602540645";

  // ======================
  // PANEL
  // ======================
  async function sendPanel() {
    const channel = await client.channels.fetch(CHANNEL_ID);

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
          emoji: {
            id: "123456789012345678",
            name: "blik"
          }
        },
        {
          label: "PAYPAL",
          value: "PAYPAL",
          emoji: {
            id: "123456789012345679",
            name: "paypal"
          }
        },
        {
          label: "CRYPTO",
          value: "CRYPTO",
          emoji: {
            id: "123456789012345680",
            name: "crypto"
          }
        },
        {
          label: "LTC",
          value: "LTC",
          emoji: {
            id: "123456789012345681",
            name: "ltc"
          }
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    console.log("✅ Panel prowizji wysłany");
  }

  // ======================
  // READY
  // ======================
  client.on(Events.ClientReady, async () => {
    setTimeout(sendPanel, 3000);
  });

  // ======================
  // INTERACTIONS
  // ======================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "show_rates") return;

    const type = interaction.values[0];
    let desc = "";

    // ======================
    // BLIK
    // ======================
    if (type === "BLIK") {
      desc = `
<:blik:123456789012345678>︲BLIK ➜ <:paypal:123456789012345679>︲PAYPAL × **8.0%**
<:blik:123456789012345678>︲BLIK ➜ <:crypto:123456789012345680>︲CRYPTO × **8.0%**
<:blik:123456789012345678>︲BLIK ➜ <:ltc:123456789012345681>︲LTC × **8.0%**

⚠️ Minimalna prowizja przy wymianie z **BLIK** wynosi **2 PLN**
`;
    }

    // ======================
    // PAYPAL
    // ======================
    if (type === "PAYPAL") {
      desc = `
<:paypal:123456789012345679>︲PAYPAL ➜ <:blik:123456789012345678>︲BLIK × **7.0%**
<:paypal:123456789012345679>︲PAYPAL ➜ <:crypto:123456789012345680>︲CRYPTO × **7.0%**
<:paypal:123456789012345679>︲PAYPAL ➜ <:ltc:123456789012345681>︲LTC × **7.5%**

⚠️ Minimalna prowizja przy wymianie z **PAYPAL** wynosi **2 PLN**
`;
    }

    // ======================
    // CRYPTO
    // ======================
    if (type === "CRYPTO") {
      desc = `
<:crypto:123456789012345680>︲CRYPTO ➜ <:paypal:123456789012345679>︲PAYPAL × **3.5%**
<:crypto:123456789012345680>︲CRYPTO ➜ <:blik:123456789012345678>︲BLIK × **3.5%**
<:crypto:123456789012345680>︲CRYPTO ➜ <:ltc:123456789012345681>︲LTC × **3.5%**

⚠️ Minimalna prowizja przy wymianie z **CRYPTO** wynosi **2 PLN**
`;
    }

    // ======================
    // LTC
    // ======================
    if (type === "LTC") {
      desc = `
<:ltc:123456789012345681>︲LTC ➜ <:paypal:123456789012345679>︲PAYPAL × **4.0%**
<:ltc:123456789012345681>︲LTC ➜ <:blik:123456789012345678>︲BLIK × **3.5%**
<:ltc:123456789012345681>︲LTC ➜ <:crypto:123456789012345680>︲CRYPTO × **3.5%**

⚠️ Minimalna prowizja przy wymianie z **LTC** wynosi **2 PLN**
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
