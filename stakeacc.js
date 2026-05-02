// stakeacc.js FINAL WORKING (pod nowy index.js)

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  // ===============================
  // CONFIG
  // ===============================
  const OWNER_ID = "1367768195167031403";
  const CHANNEL_ID = "1499812157246669001";

  let stock = 4;
  let panelMessageId = null;

  // ===============================
  // PANEL
  // ===============================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      // usuń stary panel
      if (panelMessageId) {
        try {
          const oldMsg = await channel.messages.fetch(panelMessageId);
          if (oldMsg) await oldMsg.delete();
        } catch {}
      }

      const embed = new EmbedBuilder()
        .setColor("#2b59ff")
        .setTitle("🌟 StarX Exchange » KONTO STAKE 🎰")
        .setDescription(
          "📌 Wybierz opcję z menu poniżej.\n" +
          "⚡ Natychmiastowa realizacja.\n" +
          "🔒 Pewny zakup."
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
            description: "Sprawdź cenę konta",
            value: "price",
            emoji: "💰"
          },
          {
            label: "Dostępne sztuki",
            description: "Sprawdź aktualny stock",
            value: "stock",
            emoji: "📦"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const msg = await channel.send({
        embeds: [embed],
        components: [row]
      });

      panelMessageId = msg.id;

      console.log("✅ Stake panel wysłany");

    } catch (err) {
      console.log("❌ stake panel error:", err);
    }
  }

  // ===============================
  // READY
  // ===============================
  client.once(Events.ClientReady, async () => {
    await sendPanel();
  });

  // ===============================
  // INTERACTIONS
  // ===============================
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      // ================= MENU
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId !== "stake_menu") return;

        // cena
        if (interaction.values[0] === "price") {
          return interaction.reply({
            content:
              "🎮 **KONTO STAKE (2 POZIOM WERYFIKACJI):**\n" +
              "- 🔓 Pełny dostęp (E-mail oraz Stake)\n" +
              "- 🪪 Zweryfikowane dowodem osobistym\n" +
              "- 🎯 Gotowe do wpłat i wypłat\n\n" +
              "💸 **Cena: 40 ZŁ**",
            flags: 64
          });
        }

        // stock
        if (interaction.values[0] === "stock") {
          return interaction.reply({
            content: `📦 **Dostępne sztuki: ${stock}**`,
            flags: 64
          });
        }
      }

      // ================= SLASH
      if (!interaction.isChatInputCommand()) return;

      const allowed = [
        "stakeadd",
        "stakeremove",
        "stakeset",
        "stakepanel"
      ];

      if (!allowed.includes(interaction.commandName)) return;

if (!interaction.member.roles.cache.has("1499499185337012377")) {
        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      // /stakeadd
      if (interaction.commandName === "stakeadd") {
        const amount = interaction.options.getInteger("ilosc");

        stock += amount;
        await sendPanel();

        return interaction.reply({
          content: `✅ Dodano ${amount}\n📦 Aktualnie: ${stock}`,
          flags: 64
        });
      }

      // /stakeremove
      if (interaction.commandName === "stakeremove") {
        const amount = interaction.options.getInteger("ilosc");

        stock -= amount;
        if (stock < 0) stock = 0;

        await sendPanel();

        return interaction.reply({
          content: `✅ Usunięto ${amount}\n📦 Aktualnie: ${stock}`,
          flags: 64
        });
      }

      // /stakeset
      if (interaction.commandName === "stakeset") {
        const amount = interaction.options.getInteger("ilosc");

        stock = amount;
        await sendPanel();

        return interaction.reply({
          content: `✅ Ustawiono stock na ${stock}`,
          flags: 64
        });
      }

      // /stakepanel
      if (interaction.commandName === "stakepanel") {
        await sendPanel();

        return interaction.reply({
          content: "✅ Panel odświeżony.",
          flags: 64
        });
      }

    } catch (err) {
      console.log("❌ stake interaction error:", err);
    }
  });
};
