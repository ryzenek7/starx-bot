// index.js FINAL INSTANT COMMANDS (guild version)

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
const OWNER_ID = "1367768195167031403";

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
require("./invites")(client);

// =====================
// READY
// =====================
client.once(Events.ClientReady, async () => {
  try {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const commands = [
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota"),

      new SlashCommandBuilder()
        .setName("stakeadd")
        .setDescription("Dodaj stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeremove")
        .setDescription("Usuń stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeset")
        .setDescription("Ustaw stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakepanel")
        .setDescription("Odśwież panel")

    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    // 🔥 NATYCHMIASTOWE KOMENDY NA SERWERZE
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash commands dodane instant");

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

    // owner only reset
    if (
      interaction.commandName === "reset" &&
!interaction.member.roles.cache.has("1499499185337012377")
    ) {
      return interaction.reply({
        content: "❌ Nie masz permisji.",
        flags: 64
      });
    }

    // reset
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
