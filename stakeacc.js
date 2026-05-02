// stakeacc.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch("1499812157246669001");

      if (!channel) {
        console.log("❌ Nie znaleziono kanału.");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#2b59ff")
        .setTitle("🌟 StarX Exchange » KONTO STAKE 🎰")
        .setDescription(
          "📌 Wybierz opcję z menu poniżej.\n\n" +
          "📦 Dostępne sztuki: **4**"
        )
        .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange x Stake"
        });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę",
            description: "Sprawdź cenę konta Stake",
            value: "cena",
            emoji: "💰"
          },
          {
            label: "Dostępne sztuki",
            description: "Aktualny stan magazynowy",
            value: "stock",
            emoji: "📦"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Stake panel wysłany");

    } catch (err) {
      console.log("❌ stakeacc error:", err);
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "stake_menu") return;

    if (interaction.values[0] === "cena") {
      await interaction.reply({
        content:
          "🎮 **KONTO STAKE (2 POZIOM WERYFIKACJI):**\n" +
          "- 🔓 Pełny dostęp (E-mail oraz Stake)\n" +
          "- 🪪 Zweryfikowane dowodem osobistym\n" +
          "- 🎯 Gotowe do wpłat i wypłat\n\n" +
          "💸 **Cena: 40 ZŁ**",
        ephemeral: true
      });
    }

    if (interaction.values[0] === "stock") {
      await interaction.reply({
        content: "📦 **Dostępne sztuki: 4**",
        ephemeral: true
      });
    }
  });
};
