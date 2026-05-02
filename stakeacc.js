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
        .setTitle("★ StarX Exchange » PANEL 🎰")
        .setDescription(
          "📌 Wybierz opcję z menu poniżej.\n\n" +
          "📦 Dostępne sztuki: **4**"
        )
        .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange"
        })
        .setTimestamp();

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę",
            value: "cena",
            emoji: "💰"
          },
          {
            label: "Dostępne sztuki",
            value: "stock",
            emoji: "📦"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Panel został wysłany.");
    } catch (err) {
      console.log("❌ stakeacc error:", err);
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "stake_menu") return;

    try {
      if (interaction.values[0] === "cena") {
        await interaction.reply({
          content:
            "🎮 **Informacje o produkcie:**\n" +
            "• 🔓 Pełny dostęp\n" +
            "• 📧 Dostęp do danych logowania\n" +
            "• ✅ Gotowe do użycia\n\n" +
            "💸 **Cena: 40 ZŁ**",
          ephemeral: true
        });
      }

      if (interaction.values[0] === "stock") {
        await interaction.reply({
          content: "📦 Aktualnie dostępne sztuki: **4**",
          ephemeral: true
        });
      }
    } catch (err) {
      console.log("❌ Interaction error:", err);
    }
  });
};
