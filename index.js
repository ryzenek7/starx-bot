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
    GatewayIntentBits.Guilds
  ]
});

// =====================
// 📦 MODUŁY (WSZYSTKIE POŁĄCZONE)
// =====================
require("./tickets")(client);
require("./welcome")(client);
require("./legit")(client);
require("./opinie")(client);
require("./kalkulator")(client);
require("./verify")(client);
require("./verifyping")(client);
require("./obliczprowizje")(client);
require("./stakeacc")(client);
require("./cennik")(client);

// =====================
// READY
// =====================
client.once(Events.ClientReady, async () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("reset")
      .setDescription("Restart bota"),

    new SlashCommandBuilder()
      .setName("stakeadd")
      .setDescription("Dodaj stake")
      .addIntegerOption(o =>
        o.setName("ilosc")
          .setDescription("Ilość")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("stakeremove")
      .setDescription("Usuń stake")
      .addIntegerOption(o =>
        o.setName("ilosc")
          .setDescription("Ilość")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("stakecheck")
      .setDescription("Sprawdź stake")
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Slash komendy zarejestrowane");
  } catch (err) {
    console.log("❌ Błąd rejestracji:", err);
  }
});

// =====================
// RESET (tu tylko reset)
// =====================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "reset") {
    await interaction.reply({
      content: "🔄 Restart bota...",
      ephemeral: true
    });

    setTimeout(() => process.exit(0), 1000);
  }
});

// =====================
// LOGIN
// =====================
client.login(TOKEN);
