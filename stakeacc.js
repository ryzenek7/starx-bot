const { 
  SlashCommandBuilder 
} = require("discord.js");
const fs = require("fs");

const DATA_FILE = "./stakeData.json";

// 📂 wczytywanie danych
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// 💾 zapisywanie danych
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = [
  // ➕ /stakeadd
  {
    data: new SlashCommandBuilder()
      .setName("stakeadd")
      .setDescription("Dodaje stake")
      .addIntegerOption(option =>
        option.setName("ilosc")
          .setDescription("Ilość do dodania")
          .setRequired(true)
      ),

    async execute(interaction) {
      const amount = interaction.options.getInteger("ilosc");
      const userId = interaction.user.id;

      const data = loadData();
      if (!data[userId]) data[userId] = 0;

      data[userId] += amount;
      saveData(data);

      await interaction.reply(`✅ Dodano ${amount}\n💰 Masz teraz: ${data[userId]}`);
    }
  },

  // ➖ /stakeremove
  {
    data: new SlashCommandBuilder()
      .setName("stakeremove")
      .setDescription("Usuwa stake")
      .addIntegerOption(option =>
        option.setName("ilosc")
          .setDescription("Ilość do usunięcia")
          .setRequired(true)
      ),

    async execute(interaction) {
      const amount = interaction.options.getInteger("ilosc");
      const userId = interaction.user.id;

      const data = loadData();
      if (!data[userId]) data[userId] = 0;

      data[userId] -= amount;
      if (data[userId] < 0) data[userId] = 0;

      saveData(data);

      await interaction.reply(`❌ Usunięto ${amount}\n💰 Masz teraz: ${data[userId]}`);
    }
  },

  // 📊 /stakecheck
  {
    data: new SlashCommandBuilder()
      .setName("stakecheck")
      .setDescription("Sprawdza ilość stake"),

    async execute(interaction) {
      const userId = interaction.user.id;

      const data = loadData();
      if (!data[userId]) data[userId] = 0;

      await interaction.reply(`💰 Twój stan: ${data[userId]}`);
    }
  }
];
