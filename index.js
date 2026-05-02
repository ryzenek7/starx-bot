const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");

// =====================
// CONFIG
// =====================
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1499478004265517396";

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// =====================
// READY (rejestracja komend)
// =====================
client.once(Events.ClientReady, async () => {
  try {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const commands = [

      // 🔄 RESET
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota"),

      // ➕ STAKE ADD
      new SlashCommandBuilder()
        .setName("stakeadd")
        .setDescription("Dodaje stake")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      // ➖ STAKE REMOVE
      new SlashCommandBuilder()
        .setName("stakeremove")
        .setDescription("Usuwa stake")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      // 📊 STAKE CHECK
      new SlashCommandBuilder()
        .setName("stakecheck")
        .setDescription("Sprawdza stan")

    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Komendy zarejestrowane");

  } catch (err) {
    console.log("❌ Błąd ready:", err);
  }
});

// =====================
// INTERACTIONS
// =====================
client.on(Events.InteractionCreate, async interaction => {
  try {

    if (!interaction.isChatInputCommand()) return;

    const file = "./stakeData.json";

    let data = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file));
    }

    const userId = interaction.user.id;

    if (!data[userId]) data[userId] = 0;

    // =====================
    // RESET
    // =====================
    if (interaction.commandName === "reset") {
      await interaction.reply({
        content: "🔄 Restartuję bota...",
        ephemeral: true
      });

      setTimeout(() => process.exit(0), 1000);
    }

    // =====================
    // STAKE ADD
    // =====================
    if (interaction.commandName === "stakeadd") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] += amount;
      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return interaction.reply(`✅ Dodano ${amount}\n💰 Masz: ${data[userId]}`);
    }

    // =====================
    // STAKE REMOVE
    // =====================
    if (interaction.commandName === "stakeremove") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] -= amount;
      if (data[userId] < 0) data[userId] = 0;

      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return interaction.reply(`❌ Usunięto ${amount}\n💰 Masz: ${data[userId]}`);
    }

    // =====================
    // STAKE CHECK
    // =====================
    if (interaction.commandName === "stakecheck") {
      return interaction.reply(`💰 Twój stan: ${data[userId]}`);
    }

  } catch (err) {
    console.log("❌ Błąd interaction:", err);
  }
});

// =====================
// ERROR HANDLERS
// =====================
process.on("unhandledRejection", err => {
  console.log("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", err => {
  console.log("❌ Uncaught Exception:", err);
});

// =====================
// LOGIN
// =====================
client.login(TOKEN);
