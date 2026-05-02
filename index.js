const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

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
// MODUŁY
// =====================
require("./tickets")(client);
require("./welcome")(client);
require("./legit")(client);
require("./opinie")(client);
require("./kalkulator")(client);
require("./verify")(client);
require("./verifyping")(client);
require("./obliczprowizje")(client);
require("./stakeacc")(client); // 🔥 TU DZIAŁA STAKE
require("./cennik")(client);

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

    // 🔄 RESET (tylko tutaj)
    if (interaction.commandName === "reset") {
      await interaction.reply({
        content: "🔄 Restartuję bota...",
        ephemeral: true
      });

      setTimeout(() => process.exit(0), 1000);
    }

    // ❗ RESZTA komend (stake itd.) jest w modułach

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
