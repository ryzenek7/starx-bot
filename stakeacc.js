// stakeacc.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const OWNER_ID = "TWOJE_ID_DISCORDA";
  const CHANNEL_ID = "1499812157246669001";

  const dataPath = path.join(__dirname, "stakeData.json");

  let stock = 4;
  let panelMessageId = null;

  // ========================
  // LOAD DATA
  // ========================
  function loadData() {
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      stock = data.stock || 4;
      panelMessageId = data.panelMessageId || null;
    }
  }

  function saveData() {
    fs.writeFileSync(
      dataPath,
      JSON.stringify(
        {
          stock,
          panelMessageId
        },
        null,
        2
      )
    );
  }

  // ========================
  // PANEL
  // ========================
  async function sendPanel() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    try {
      if (panelMessageId) {
        const oldMsg = await channel.messages.fetch(panelMessageId);
        if (oldMsg) await oldMsg.delete().catch(() => {});
      }
    } catch {}

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
    saveData();
  }

  // ========================
  // READY
  // ========================
  client.once(Events.ClientReady, async () => {
    loadData();
    await sendPanel();
    console.log("✅ Stake panel uruchomiony");
  });

  // ========================
  // MENU
  // ========================
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
        content: `📦 **Dostępne sztuki: ${stock}**`,
        ephemeral: true
      });
    }
  });

  // ========================
  // COMMANDS
  // ========================
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.author.id !== OWNER_ID) return;

    const args = message.content.split(" ");
    const cmd = args[0].toLowerCase();

    // .stakeadd 5
    if (cmd === ".stakeadd") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return;

      stock += amount;
      saveData();
      await sendPanel();

      return message.reply(`✅ Dodano ${amount} sztuk. Aktualnie: ${stock}`);
    }

    // .stakeremove 2
    if (cmd === ".stakeremove") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return;

      stock -= amount;
      if (stock < 0) stock = 0;

      saveData();
      await sendPanel();

      return message.reply(`✅ Usunięto ${amount} sztuk. Aktualnie: ${stock}`);
    }

    // .stakeset 10
    if (cmd === ".stakeset") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return;

      stock = amount;
      saveData();
      await sendPanel();

      return message.reply(`✅ Ustawiono stock na ${stock}`);
    }

    // .stakepanel
    if (cmd === ".stakepanel") {
      await sendPanel();
      return message.reply("✅ Panel odświeżony.");
    }
  });
};
