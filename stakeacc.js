const fs = require("fs");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const FILE = "./stakeData.json";
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

// =====================
// PANEL CREATOR
// =====================
async function sendOrUpdatePanel(client) {
  const channel = await client.channels.fetch(CHANNEL_ID);

  const data = loadData();

  let total = 0;
  for (const v of Object.values(data)) {
    total += v;
  }

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🥩 KONTO STAKE")
    .setDescription(
      `📦 **Dostępne konta: ${total}**\n\n` +
      `Wybierz akcję poniżej`
    );

  const menu = new StringSelectMenuBuilder()
    .setCustomId("stake_menu")
    .setPlaceholder("📦 Wybierz akcję")
    .addOptions([
      {
        label: "Sprawdź konto",
        value: "check",
        emoji: "📊"
      },
      {
        label: "Cena konta",
        value: "price",
        emoji: "💰"
      }
    ]);

  const row = new ActionRowBuilder().addComponents(menu);

  const messages = await channel.messages.fetch({ limit: 10 });
  const old = messages.find(m =>
    m.author.id === client.user.id &&
    m.components.length > 0
  );

  if (old) {
    await old.edit({
      embeds: [embed],
      components: [row]
    });
  } else {
    await channel.send({
      embeds: [embed],
      components: [row]
    });
  }
}

// =====================
// MODULE
// =====================
module.exports = (client) => {

  // 📌 PANEL START
  client.once("ready", async () => {
    console.log("✅ stakeacc aktywny");
    await sendOrUpdatePanel(client);
  });

  // =====================
  // INTERACTIONS MENU
  // =====================
  client.on("interactionCreate", async interaction => {

    // MENU
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "stake_menu") return;

      const data = loadData();
      let total = 0;
      for (const v of Object.values(data)) total += v;

      if (interaction.values[0] === "check") {
        return interaction.reply({
          content: `📦 Aktualnie: ${total} kont`,
          ephemeral: true
        });
      }

      if (interaction.values[0] === "price") {
        return interaction.reply({
          content: `💰 Cena konta: 40 ZŁ`,
          ephemeral: true
        });
      }
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
