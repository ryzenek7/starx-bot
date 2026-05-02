// stakeacc.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  // =========================
  // USTAWIENIA
  // =========================
  const OWNER_ID = "1499499185337012377";
  const CHANNEL_ID = "1499812157246669001";

  let stock = 4;
  let panelMessageId = null;

  // =========================
  // PANEL
  // =========================
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
        })
        .setTimestamp();

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę",
            value: "cena",
            description: "Sprawdź cenę konta",
            emoji: "💰"
          },
          {
            label: "Dostępne sztuki",
            value: "stock",
            description: "Sprawdź aktualny stock",
            emoji: "📦"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const msg = await channel.send({
        embeds: [embed],
        components: [row]
      });

      panelMessageId = msg.id;

      console.log("✅ Stake panel uruchomiony");
    } catch (err) {
      console.log("❌ Błąd panelu stake:", err);
    }
  }

  // =========================
  // READY
  // =========================
  client.once(Events.ClientReady, async () => {
    await sendPanel();
  });

  // =========================
  // MENU
  // =========================
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
        flags: 64
      });
    }

    if (interaction.values[0] === "stock") {
      await interaction.reply({
        content: `📦 **Dostępne sztuki: ${stock}**`,
        flags: 64
      });
    }
  });

  // =========================
  // OWNER COMMANDS
  // =========================
  client.on(Events.MessageCreate, async (message) => {
    console.log(`KOMENDA WYKRYTA: ${message.content}`);

    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id !== OWNER_ID) return;

    const args = message.content.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    // .stakeadd 1
    if (cmd === ".stakeadd") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply("❌ Podaj liczbę.");

      stock += amount;
      await sendPanel();

      return message.reply(`✅ Dodano ${amount}. Aktualnie: ${stock}`);
    }

    // .stakeremove 1
    if (cmd === ".stakeremove") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply("❌ Podaj liczbę.");

      stock -= amount;
      if (stock < 0) stock = 0;

      await sendPanel();

      return message.reply(`✅ Usunięto ${amount}. Aktualnie: ${stock}`);
    }

    // .stakeset 10
    if (cmd === ".stakeset") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply("❌ Podaj liczbę.");

      stock = amount;
      await sendPanel();

      return message.reply(`✅ Ustawiono stock na ${stock}`);
    }

    // .stakepanel
    if (cmd === ".stakepanel") {
      await sendPanel();
      return message.reply("✅ Panel odświeżony.");
    }

    // .stakehelp
    if (cmd === ".stakehelp") {
      return message.reply(
        "**Komendy:**\n" +
        "`.stakeadd 1`\n" +
        "`.stakeremove 1`\n" +
        "`.stakeset 10`\n" +
        "`.stakepanel`\n" +
        "`.stakehelp`"
      );
    }
  });
};
