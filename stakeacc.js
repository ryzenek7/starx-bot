// stakeacc.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  // ===============================
  // PANEL AUTO PO STARCIE BOTA
  // ===============================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch("1499812157246669001");

      const embed = new EmbedBuilder()
        .setColor("#ff2b2b")
        .setTitle("★ StarX Exchange » KONTO STAKE 🎰")
        .setDescription(
          "📌 Wybierz opcję z menu poniżej.\n\n" +
          "📦 Dostępne sztuki: **0**"
        )
        .setImage("https://i.imgur.com/y8KQK0w.png") // stake image
        .setFooter({
          text: "© 2026 StarX Exchange x Stake"
        });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę konta",
            description: "Sprawdź aktualną cenę",
            value: "cena",
            emoji: "💰"
          },
          {
            label: "Kup konto",
            description: "Kup konto Stake",
            value: "kup",
            emoji: "🛒"
          },
          {
            label: "Pomoc",
            description: "Pomoc / kontakt",
            value: "help",
            emoji: "📩"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Stake panel wysłany");

    } catch (err) {
      console.log("❌ Błąd stakeacc:", err);
    }
  });

  // ===============================
  // MENU
  // ===============================
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "stake_menu") return;

    if (interaction.values[0] === "cena") {
      await interaction.reply({
        content: "💰 Aktualna cena konta Stake: **20 PLN**",
        ephemeral: true
      });
    }

    if (interaction.values[0] === "kup") {
      await interaction.reply({
        content: "🛒 Napisz ticket aby kupić konto.",
        ephemeral: true
      });
    }

    if (interaction.values[0] === "help") {
      await interaction.reply({
        content: "📩 Skontaktuj się z administracją.",
        ephemeral: true
      });
    }
  });

};
