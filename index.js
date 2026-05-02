// index.js FINAL FIXED

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
const OWNER_ID = "1499499185337012377";

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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
require("./obliczprowizje")(client);
require("./cennik")(client);
require("./stakeacc")(client);
require("./regulamin")(client);
require("./verify")(client);
require("./verifyping")(client);
require("./propozycje")(client);

// =====================
// READY
// =====================
client.once(Events.ClientReady, async () => {
  try {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const commands = [
      // RESET
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota"),

      // STAKE ADD
      new SlashCommandBuilder()
        .setName("stakeadd")
        .setDescription("Dodaj stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      // STAKE REMOVE
      new SlashCommandBuilder()
        .setName("stakeremove")
        .setDescription("Usuń stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      // STAKE SET
      new SlashCommandBuilder()
        .setName("stakeset")
        .setDescription("Ustaw stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      // PANEL
      new SlashCommandBuilder()
        .setName("stakepanel")
        .setDescription("Odśwież panel")

    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Wszystkie slash komendy dodane");

  } catch (err) {
    console.log("❌ Ready error:", err);
  }
});

// =====================
// INTERACTIONS
// =====================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    // OWNER ONLY
    if (
      ["reset"].includes(interaction.commandName) &&
      interaction.user.id !== OWNER_ID
    ) {
      return interaction.reply({
        content: "❌ Nie masz permisji.",
        flags: 64
      });
    }

    // RESET
    if (interaction.commandName === "reset") {
      await interaction.reply({
        content: "🔄 Restartuję bota...",
        flags: 64
      });

      return setTimeout(() => process.exit(0), 1000);
    }

  } catch (err) {
    console.log("❌ Interaction error:", err);
  }
});

// =====================
// ERRORS
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
