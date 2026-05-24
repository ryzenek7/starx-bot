// index.js STARX EXCHANGE FINAL (CLEAN FIX)

const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits
} = require("discord.js");

// =====================================
// CONFIG
// =====================================
const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1499478004265517396";
const GUILD_ID = "1499481942394146946";

const OWNER_ROLE_ID = "1499499185337012377";

// =====================================
// CLIENT
// =====================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

console.log("🚀 Uruchamianie StarX Exchange Bot...");

if (!TOKEN) {
  console.log("❌ Brak tokena!");
  process.exit(1);
}

// =====================================
// MODULES
// =====================================
const modules = [
  "./tickets",
  "./welcome",
  "./legit",
  "./opinie",
  "./kalkulator",
  "./obliczprowizje",
  "./cennik",
  "./regulamin",
  "./verify",
  "./propozycje",
  "./invites",
  "./rep",
  "./lc",
  "./giveaway",
  "./przejmij"
];

for (const mod of modules) {
  try {
    require(mod)(client);
  } catch (err) {
    console.log(`❌ Błąd modułu ${mod}:`, err.message);
  }
}

// =====================================
// READY
// =====================================
client.once(Events.ClientReady, async () => {
  try {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const commands = [
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

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
          o.setName("osoba")
            .setDescription("Użytkownik")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("testinvite")
        .setDescription("Dodaj testowe zaproszenia")
        .addUserOption(o =>
          o.setName("osoba")
            .setDescription("Użytkownik")
            .setRequired(true)
        )
        .addIntegerOption(o =>
          o.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("lc")
        .setDescription("Legit check template"),

      new SlashCommandBuilder()
        .setName("przejmij")
        .setDescription("Przejmij ticket")
        .addUserOption(o =>
          o.setName("uzytkownik")
            .setDescription("Klient")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("odprzyjmij")
        .setDescription("Oddaj ticket")
    ].map(c => c.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash commands deployed");

  } catch (err) {
    console.log("❌ READY ERROR:", err);
  }
});

// =====================================
// RESET COMMAND
// =====================================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "reset") {

      if (!interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Brak permisji.",
          flags: 64
        });
      }

      await interaction.reply({
        content: "🔄 Restart bota...",
        flags: 64
      });

      setTimeout(() => process.exit(0), 1000);
    }

  } catch (err) {
    console.log("❌ Interaction error:", err);
  }
});

// =====================================
// ERRORS
// =====================================
process.on("unhandledRejection", err => {
  console.log("❌ UnhandledRejection:", err);
});

process.on("uncaughtException", err => {
  console.log("❌ UncaughtException:", err);
});

// =====================================
// LOGIN
// =====================================
client.login(TOKEN);
