// index.js STARX EXCHANGE FINAL PREMIUM + OWNER CHECKINVITES + TESTINVITE

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
const GUILD_ID = "1499481942394146946";

// rola owner/admin
const OWNER_ROLE_ID = "1499499185337012377";

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.MessageContent
  ]
});

// =====================
// START
// =====================
console.log("🚀 Uruchamianie StarX Exchange Bot...");

// =====================
// MODULES
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
require("./invites")(client);

// =====================
// READY
// =====================
client.once(Events.ClientReady, async () => {
  try {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const commands = [

      // =====================
      // ADMIN
      // =====================
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota"),

      new SlashCommandBuilder()
        .setName("stakeadd")
        .setDescription("Dodaj stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Podaj ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeremove")
        .setDescription("Usuń stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Podaj ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeset")
        .setDescription("Ustaw stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Podaj ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakepanel")
        .setDescription("Odśwież panel stock"),

      // =====================
      // INVITES
      // =====================
      new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Sprawdź ile osób zaprosiłeś"),

      new SlashCommandBuilder()
        .setName("topinvites")
        .setDescription("Ranking zaproszeń"),

      new SlashCommandBuilder()
        .setName("myinvite")
        .setDescription("Wygeneruj swój link zaproszenia"),

      new SlashCommandBuilder()
        .setName("checkinvites")
        .setDescription("Sprawdź ile zaproszeń ma użytkownik")
        .addUserOption(option =>
          option.setName("osoba")
            .setDescription("Wybierz użytkownika")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("testinvite")
        .setDescription("Dodaj testowe zaproszenia użytkownikowi")
        .addUserOption(option =>
          option.setName("osoba")
            .setDescription("Wybierz użytkownika")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ile dodać zaproszeń")
            .setRequired(true)
        )

    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Komendy slash zostały dodane");

  } catch (err) {
    console.log("❌ Ready error:", err);
  }
});

// =====================
// GLOBAL COMMANDS
// =====================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    // =====================
    // RESET
    // =====================
    if (interaction.commandName === "reset") {

      if (!interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      await interaction.reply({
        content: "🔄 Restartuję bota...",
        flags: 64
      });

      return setTimeout(() => process.exit(0), 1000);
    }

    // =====================
    // OWNER ONLY COMMANDS
    // =====================
    if (
      interaction.commandName === "checkinvites" ||
      interaction.commandName === "testinvite"
    ) {
      if (!interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Tylko właściciel może użyć tej komendy.",
          flags: 64
        });
      }

      // dalszą obsługę robi invites.js
      return;
    }

  } catch (err) {
    console.log("❌ Interaction error:", err);
  }
});

// =====================
// ERRORS
// =====================
process.on("unhandledRejection", err => {
  console.log("❌ UnhandledRejection:", err);
});

process.on("uncaughtException", err => {
  console.log("❌ UncaughtException:", err);
});

// =====================
// LOGIN
// =====================
client.login(TOKEN);
