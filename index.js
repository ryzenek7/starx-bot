// index.js STARX EXCHANGE FINAL PREMIUM

const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits
} = require("discord.js");

// =====================
// CONFIG
// =====================
const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1499478004265517396";
const GUILD_ID = "1499481942394146946";

const OWNER_ROLE_ID = "1499499185337012377";

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
// START
// =====================
console.log("🚀 Uruchamianie StarX Exchange Bot...");

if (!TOKEN) {
  console.log("❌ BRAK TOKENA w ENV!");
  process.exit(1);
}

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
require("./propozycje")(client);
require("./invites")(client);
require("./rep")(client);
require("./lc")(client);
require("./giveaway")(client);

// =====================
// READY + SLASH COMMANDS
// =====================
client.once(Events.ClientReady, async () => {

  try {

    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const commands = [

      // =====================
      // RESET
      // =====================
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

      // =====================
      // STAKE SYSTEM
      // =====================
      new SlashCommandBuilder()
        .setName("stakeadd")
        .setDescription("Dodaj stock")
        .addIntegerOption(o =>
          o.setName("ilosc").setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeremove")
        .setDescription("Usuń stock")
        .addIntegerOption(o =>
          o.setName("ilosc").setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeset")
        .setDescription("Ustaw stock")
        .addIntegerOption(o =>
          o.setName("ilosc").setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakepanel")
        .setDescription("Odśwież panel stock"),

      // =====================
      // INVITES
      // =====================
      new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Sprawdź swoje zaproszenia"),

      new SlashCommandBuilder()
        .setName("topinvites")
        .setDescription("Ranking zaproszeń"),

      new SlashCommandBuilder()
        .setName("myinvite")
        .setDescription("Twój link zaproszenia"),

      new SlashCommandBuilder()
        .setName("checkinvites")
        .setDescription("Sprawdź zaproszenia użytkownika")
        .addUserOption(o =>
          o.setName("osoba").setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("testinvite")
        .setDescription("Dodaj testowe zaproszenia")
        .addUserOption(o =>
          o.setName("osoba").setRequired(true)
        )
        .addIntegerOption(o =>
          o.setName("ilosc").setRequired(true)
        ),

      // =====================
      // LC
      // =====================
      new SlashCommandBuilder()
        .setName("lc")
        .setDescription("Legit check template")

    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash commands deployed");

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

    // =====================
    // RESET
    // =====================
    if (interaction.commandName === "reset") {

      if (!interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Brak permisji.",
          flags: 64
        });
      }

      await interaction.reply({
        content: "🔄 Restart...",
        flags: 64
      });

      return setTimeout(() => process.exit(0), 1000);
    }

    // =====================
    // OWNER CHECK SYSTEM
    // =====================
    const ownerOnly = ["checkinvites", "testinvite"];

    if (ownerOnly.includes(interaction.commandName)) {

      if (!interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Tylko owner.",
          flags: 64
        });
      }

      // NIE blokujemy execution — tylko kontrola
    }

  } catch (err) {
    console.log("❌ Interaction error:", err);
  }
});

// =====================
// SAFETY
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
