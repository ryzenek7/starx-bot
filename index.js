const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= LOAD MODULES =================

const cennik = require("./cennik");
const kalkulator = require("./kalkulator");
const legit = require("./legit");
const obliczprowizje = require("./obliczprowizje");
const opinie = require("./opinie");
const tickets = require("./tickets");
const verify = require("./verify");
const verifyping = require("./verifyping");
const welcome = require("./welcome");
const stakeacc = require("./stakeacc");

// ================= READY =================

client.on("ready", () => {
  console.log(`Zalogowano jako ${client.user.tag}`);

  if (welcome.init) welcome.init(client);
  if (verify.init) verify.init(client);
  if (tickets.init) tickets.init(client);
});

// ================= COMMAND ROUTER =================

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const cmd = args.shift().toLowerCase();

  try {
    if (cennik.run) cennik.run(message, args);
    if (kalkulator.run) kalkulator.run(message, args, cmd);
    if (legit.run) legit.run(message, args, cmd);
    if (obliczprowizje.run) obliczprowizje.run(message, args, cmd);
    if (opinie.run) opinie.run(message, args);
  } catch (e) {
    console.log("Error module:", e);
  }
});

// ================= INTERACTIONS =================

client.on("interactionCreate", async interaction => {
  try {
    if (tickets.interaction) await tickets.interaction(interaction);
    if (verify.interaction) await verify.interaction(interaction);
    if (stakeacc.interaction) await stakeacc.interaction(interaction);
  } catch (e) {
    console.log("Interaction error:", e);
  }
});

client.login("YOUR_TOKEN");
