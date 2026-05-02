// stakeacc.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  // =========================
  // USTAWIENIA
  // =========================
  const OWNER_ID = "1499499185337012377";
  const CHANNEL_ID = "1499812157246669001";

  const dataPath = path.join(__dirname, "stakeData.json");

  let stock = 4;
  let panelMessageId = null;

  // =========================
  // LOAD / SAVE
  // =========================
  function loadData() {
    try {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

        stock = data.stock ?? 4;
        panelMessageId = data.panelMessageId ?? null;
      }
    } catch (err) {
      console.log("❌ Błąd odczytu stakeData.json");
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
        .setDescription("📌 Wybierz opcję z menu poniżej.")
        .setImage(
          "https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand"
        )
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
            value: "cena",
            emoji: "💰"
          },
          {
            label: "Dostępne sztuki",
            description: "Sprawdź stan magazynowy",
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
      saveData();

      console.log("✅ Stake panel uruchomiony");
    } catch (err) {
      console.log("❌ Błąd panelu stake:", err);
    }
  }

  // =========================
  // READY
  // =========================
  client.once(Events.ClientReady, async () => {
    loadData();
    await sendPanel();
  });

  // =========================
  // MENU
  // =========================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "stake_menu") return;

    try {
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
    } catch (err) {
      console.log("❌ Błąd menu:", err);
    }
  });

  // =========================
  // KOMENDY OWNERA
  // =========================
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.author.id !== OWNER_ID) return;

    const args = message.content.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    // .stakeadd 5
    if (cmd === ".stakeadd") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) {
        return message.reply("❌ Podaj ilość.");
      }

      stock += amount;
      saveData();
      await sendPanel();

      return message.reply(`✅ Dodano ${amount}. Aktualnie: ${stock}`);
    }

    // .stakeremove 2
    if (cmd === ".stakeremove") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) {
        return message.reply("❌ Podaj ilość.");
      }

      stock -= amount;
      if (stock < 0) stock = 0;

      saveData();
      await sendPanel();

      return message.reply(`✅ Usunięto ${amount}. Aktualnie: ${stock}`);
    }

    // .stakeset 10
    if (cmd === ".stakeset") {
      const amount = parseInt(args[1]);
      if (isNaN(amount)) {
        return message.reply("❌ Podaj ilość.");
      }

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

    // .stakehelp
    if (cmd === ".stakehelp") {
      return message.reply(
        "**Komendy:**\n" +
          "`.stakeadd 5`\n" +
          "`.stakeremove 2`\n" +
          "`.stakeset 10`\n" +
          "`.stakepanel`\n" +
          "`.stakehelp`"
      );
    }
  });
};
