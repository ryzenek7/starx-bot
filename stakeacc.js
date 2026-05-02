const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499812157246669001";

  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("⭐ StarX Exchange » KONTO STAKE 🎰")
        .setDescription("💸 Wybierz opcję z menu poniżej.")
        .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange x Stake"
        });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę konta",
            value: "konto_stake",
            emoji: "💰"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Panel stake wysłany");
    } catch (err) {
      console.log(err);
    }
  }

  if (client.isReady()) {
    sendPanel();
  } else {
    client.once(Events.ClientReady, sendPanel);
  }

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "stake_menu") return;

    if (interaction.values[0] === "konto_stake") {
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("⭐ KONTO STAKE » CENA")
        .setDescription(`
🎮 **KONTO STAKE (2 POZIOM WERYFIKACJI):**
- 🔓 Pełny dostęp (E-mail oraz Stake)
- 🪪 Zweryfikowane dowodem osobistym
- 🎯 Gotowe do wpłat i wypłat

💸 **Cena: 40 ZŁ**
        `)
        .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "StarX Exchange © 2026"
        });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

      // RESET MENU = brak zaznaczenia
      const newMenu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę konta",
            value: "konto_stake",
            emoji: "💰"
          }
        ]);

      const newRow = new ActionRowBuilder().addComponents(newMenu);

      await interaction.message.edit({
        components: [newRow]
      });
    }
  });
};
