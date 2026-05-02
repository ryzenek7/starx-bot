const fs = require("fs");

const FILE = "./stakeData.json";
const CHANNEL_ID = "1499812157246669001";

// =====================
// HELPERS
// =====================
function loadData() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// =====================
// MODULE
// =====================
module.exports = (client) => {

  // =====================
  // 📩 PANEL NA KANAŁ
  // =====================
  client.once("ready", async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel) return console.log("❌ Nie znaleziono kanału stake!");

      await channel.send({
        content: "🥩 **KONTO STAKE PANEL AKTYWNY**\nUżyj komend:\n`/stakeadd`\n`/stakeremove`\n`/stakecheck`"
      });

      console.log("✅ Panel stake wysłany na kanał");
    } catch (err) {
      console.log("❌ Błąd wysyłania panelu:", err);
    }
  });

  // =====================
  // 💰 STAKE SYSTEM
  // =====================
  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    let data = loadData();

    const userId = interaction.user.id;
    if (!data[userId]) data[userId] = 0;

    // ➕ ADD
    if (interaction.commandName === "stakeadd") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] += amount;
      saveData(data);

      return interaction.reply(`✅ Dodano ${amount}\n💰 Masz: ${data[userId]}`);
    }

    // ➖ REMOVE
    if (interaction.commandName === "stakeremove") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] -= amount;
      if (data[userId] < 0) data[userId] = 0;

      saveData(data);

      return interaction.reply(`❌ Usunięto ${amount}\n💰 Masz: ${data[userId]}`);
    }

    // 📊 CHECK
    if (interaction.commandName === "stakecheck") {
      return interaction.reply(`💰 Twój stake: ${data[userId]}`);
    }
  });

  console.log("✅ stakeacc aktywny");
};
