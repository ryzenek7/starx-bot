const {
  Events,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");

module.exports = (client) => {

  // ==========================
  // CONFIG
  // ==========================
  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = "1499478004265517396";
  const GUILD_ID = "1499481942394146946";

  const OWNER_ROLE_ID = "1499499185337012377";
  const USER_ROLE_ID = "1499521304146083954"; // zwykły użytkownik

  const DATA_FILE = "./invitesData.json";

  // ==========================
  // DATA
  // ==========================
  let invitesCache = new Map();
  let inviteStats = {};

  if (fs.existsSync(DATA_FILE)) {
    inviteStats = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inviteStats, null, 2));
  }

  function addInvite(userId) {
    if (!inviteStats[userId]) inviteStats[userId] = 0;
    inviteStats[userId]++;
    saveData();
  }

  // ==========================
  // PERMISJE
  // ==========================
  function hasAccess(member) {
    return (
      member.roles.cache.has(USER_ROLE_ID) ||
      member.roles.cache.has(OWNER_ROLE_ID)
    );
  }

  // ==========================
  // REGISTER COMMANDS
  // ==========================
  async function registerCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Sprawdź zaproszenia")
        .addUserOption(option =>
          option
            .setName("uzytkownik")
            .setDescription("Kogo sprawdzić")
            .setRequired(false)
        ),

      new SlashCommandBuilder()
        .setName("topinvites")
        .setDescription("Ranking zaproszeń"),

      new SlashCommandBuilder()
        .setName("resetinvites")
        .setDescription("Reset zaproszeń")
        .addUserOption(option =>
          option
            .setName("uzytkownik")
            .setDescription("Kogo zresetować")
            .setRequired(true)
        )

    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Invites commands loaded");
  }

  // ==========================
  // READY
  // ==========================
  client.once(Events.ClientReady, async () => {
    try {
      await registerCommands();

      const guild = await client.guilds.fetch(GUILD_ID);
      const invites = await guild.invites.fetch();

      invitesCache.set(guild.id, invites);

      console.log("✅ Invites system ready");

    } catch (err) {
      console.log(err);
    }
  });

  // ==========================
  // JOIN
  // ==========================
  client.on(Events.GuildMemberAdd, async member => {
    try {
      const newInvites = await member.guild.invites.fetch();
      const oldInvites = invitesCache.get(member.guild.id);

      const usedInvite = newInvites.find(invite =>
        oldInvites.get(invite.code)?.uses < invite.uses
      );

      invitesCache.set(member.guild.id, newInvites);

      if (!usedInvite) return;

      addInvite(usedInvite.inviter.id);

    } catch (err) {
      console.log(err);
    }
  });

  // ==========================
  // COMMANDS
  // ==========================
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {

      // ======================
      // /invites
      // ======================
      if (interaction.commandName === "invites") {

        if (!hasAccess(interaction.member)) {
          return interaction.reply({
            content: "❌ Nie masz permisji.",
            flags: 64
          });
        }

        const target =
          interaction.options.getUser("uzytkownik") ||
          interaction.user;

        const count = inviteStats[target.id] || 0;

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🌟 StarX Exchange » INVITES")
          .setDescription(
`👤 Użytkownik: ${target}

📨 Zaproszenia: **${count}**`
          );

        return interaction.reply({
          embeds: [embed]
        });
      }

      // ======================
      // /topinvites
      // ======================
      if (interaction.commandName === "topinvites") {

        if (!hasAccess(interaction.member)) {
          return interaction.reply({
            content: "❌ Nie masz permisji.",
            flags: 64
          });
        }

        const sorted = Object.entries(inviteStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        let text = "";

        for (let i = 0; i < sorted.length; i++) {
          text += `**${i + 1}.** <@${sorted[i][0]}> — **${sorted[i][1]}**\n`;
        }

        if (!text) text = "Brak danych.";

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🏆 StarX Exchange » TOP INVITES")
          .setDescription(text);

        return interaction.reply({
          embeds: [embed]
        });
      }

      // ======================
      // /resetinvites
      // ======================
      if (interaction.commandName === "resetinvites") {

        if (!interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
          return interaction.reply({
            content: "❌ Nie masz permisji.",
            flags: 64
          });
        }

        const user = interaction.options.getUser("uzytkownik");

        inviteStats[user.id] = 0;
        saveData();

        return interaction.reply({
          content: `✅ Zresetowano ${user}`,
          flags: 64
        });
      }

    } catch (err) {
      console.log(err);
    }
  });

};
