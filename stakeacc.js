const fs = require("fs");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

// =====================
// FILES
// =====================
const FILE = "./stakeData.json";
const PANEL_FILE = "./panel.json";
const CHANNEL_ID = "1499812157246669001";

// =====================
// DATA
// =====================
function loadData() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function savePanel(id) {
  fs.writeFileSync(PANEL_FILE, JSON.stringify({ id }));
}

function loadPanel() {
  if (!fs.existsSync(PANEL_FILE)) return null;
  return JSON.parse(fs.readFileSync(PANEL_FILE));
}

// =====================
// PANEL SYSTEM
// =====================
async function sendOrUpdatePanel(client) {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const data = loadData();

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const embed = new EmbedBuilder()
    .setColor("#111214")
    .setTitle("🌟 STAKE ACCESS PANEL")
    .setDescription(
      `✅ **Wybierz konto z listy poniżej**\n\n` +
      `🔒 Bezpieczny dostęp\n` +
      `🚀 Instant delivery\n\n` +
      `📦 **Dostępne konta: ${total}**`
    )
    .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand");

  // =====================
  // DROPDOWN ACCOUNTS
  // =====================
  const options = [];

  for (let i = 1; i <= Math.min(total, 25); i++) {
    options.push({
      label: `Konto #${i}`,
      value: `konto_${i}`,
      emoji: "🥩"
    });
  }

  if (options.length === 0) {
    options.push({
      label: "Brak kont",
      value: "brak",
      emoji: "❌"
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("stake_select")
    .setPlaceholder("🥩 Wybierz konto")
    .addOptions(options);

  const row = new ActionRowBuilder().addComponents(menu);

  // =====================
  // DELETE OLD PANEL
  // =====================
  const panelData = loadPanel();

  if (panelData?.id) {
    try {
      const oldMsg = await channel.messages.fetch(panelData.id);
      await oldMsg.delete();
    } catch {}
  }

  // =====================
  // SEND NEW PANEL
  // =====================
  const msg = await channel.send({
    embeds: [embed],
    components: [row]
  });

  savePanel(msg.id);
}

// =====================
// MODULE EXPORT
// =====================
module.exports = (client) => {

  // 🔥 START PANEL
  client.once("ready", async () => {
    console.log("✅ stakeacc aktywny");
    await sendOrUpdatePanel(client);
  });

  // =====================
  // SELECT MENU
  // =====================
  client.on("interactionCreate", async interaction => {

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "stake_select") return;

      const value = interaction.values[0];

      if (value === "brak") {
        return interaction.reply({
          content: "❌ Brak dostępnych kont",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `🥩 Wybrałeś: **${value}**`,
        ephemeral: true
      });
    }

    // =====================
    // COMMANDS (REFRESH PANEL)
    // =====================
    if (!interaction.isChatInputCommand()) return;

    const data = loadData();
    const userId = interaction.user.id;

    if (!data[userId]) data[userId] = 0;

    // ➕ ADD
    if (interaction.commandName === "stakeadd") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] += amount;
      saveData(data);

      await interaction.reply({
        content: `✅ Dodano ${amount}`,
        ephemeral: true
      });

      return sendOrUpdatePanel(client);
    }

    // ➖ REMOVE
    if (interaction.commandName === "stakeremove") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] -= amount;
      if (data[userId] < 0) data[userId] = 0;

      saveData(data);

      await interaction.reply({
        content: `❌ Usunięto ${amount}`,
        ephemeral: true
      });

      return sendOrUpdatePanel(client);
    }

    // 📊 CHECK
    if (interaction.commandName === "stakecheck") {
      await interaction.reply({
        content: `💰 Twój stake: ${data[userId]}`,
        ephemeral: true
      });

      return sendOrUpdatePanel(client);
    }
  });
};
