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

// OWNER
const OWNER_ROLE_ID = "1499499185337012377";

// STAFF
const STAFF_ROLE_ID = "1500930428993933373";

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
  console.log("❌ Brak TOKEN w ENV");
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
require("./regulamin")(client);
require("./verify")(client);
require("./propozycje")(client);
require("./invites")(client);
require("./rep")(client);
require("./lc")(client);
require("./giveaway")(client);
require("./przejmij")(client);

// =====================
// READY
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
        .setDefaultMemberPermissions(
          PermissionFlagsBits.Administrator
        ),

      // =====================
      // PRZEJMIJ
      // =====================
      new SlashCommandBuilder()
        .setName("przejmij")
        .setDescription("Przejmij ticket")

        .addUserOption(option =>
          option
            .setName("uzytkownik")
            .setDescription("Właściciel ticketa")
            .setRequired(true)
        )

        .setDefaultMemberPermissions(
          PermissionFlagsBits.Administrator
        ),

      // =====================
      // ODPRZYJMIJ
      // =====================
      new SlashCommandBuilder()
        .setName("odprzyjmij")
        .setDescription("Przywróć ticket")

        .setDefaultMemberPermissions(
          PermissionFlagsBits.Administrator
        ),

      // =====================
      // GIVEAWAY
      // =====================
      new SlashCommandBuilder()
        .setName("konkurs")
        .setDescription("Stwórz nowy konkurs")

        .addStringOption(option =>
          option
            .setName("nagroda")
            .setDescription("Nagroda")
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName("czas")
            .setDescription("Np. 10m, 1h, 1d")
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName("wymagania")
            .setDescription("Wymagania")
            .setRequired(true)
        ),

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
        .setDescription("Wygeneruj swój link"),

      new SlashCommandBuilder()
        .setName("checkinvites")
        .setDescription("Sprawdź zaproszenia użytkownika")

        .addUserOption(option =>
          option
            .setName("osoba")
            .setDescription("Użytkownik")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("testinvite")
        .setDescription("Dodaj testowe zaproszenia")

        .addUserOption(option =>
          option
            .setName("osoba")
            .setDescription("Użytkownik")
            .setRequired(true)
        )

        .addIntegerOption(option =>
          option
            .setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      // =====================
      // LC
      // =====================
      new SlashCommandBuilder()
        .setName("lc")
        .setDescription("Wyślij legit check")

    ].map(cmd => cmd.toJSON());

    const rest =
      new REST({ version: "10" })
        .setToken(TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: commands
      }
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

      if (
        !interaction.member.roles.cache.has(
          OWNER_ROLE_ID
        )
      ) {

        return interaction.reply({
          content: "❌ Brak permisji.",
          flags: 64
        });
      }

      await interaction.reply({
        content: "🔄 Restartuję bota...",
        flags: 64
      });

      return setTimeout(() => {
        process.exit(0);
      }, 1000);
    }

    // =====================
    // OWNER ONLY
    // =====================
    const ownerOnly = [
      "checkinvites",
      "testinvite"
    ];

    if (
      ownerOnly.includes(
        interaction.commandName
      )
    ) {

      if (
        !interaction.member.roles.cache.has(
          OWNER_ROLE_ID
        )
      ) {

        return interaction.reply({
          content: "❌ Tylko owner.",
          flags: 64
        });
      }
    }

    // =====================
    // STAFF ONLY
    // =====================
    const staffOnly = [
      "przejmij",
      "odprzyjmij"
    ];

    if (
      staffOnly.includes(
        interaction.commandName
      )
    ) {

      if (
        !interaction.member.roles.cache.has(
          STAFF_ROLE_ID
        )
      ) {

        return interaction.reply({
          content: "❌ Brak permisji.",
          flags: 64
        });
      }
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
