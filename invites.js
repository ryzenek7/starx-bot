const {
  Events,
  EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

  const invitesData = new Map();

  // =========================
  // READY - cache invite
  // =========================
  client.once(Events.ClientReady, async () => {
    for (const guild of client.guilds.cache.values()) {
      const invites = await guild.invites.fetch().catch(() => null);
      if (invites) invitesData.set(guild.id, invites);
    }

    console.log("✅ Invites system loaded");
  });

  // =========================
  // JOIN TRACK
  // =========================
  client.on(Events.GuildMemberAdd, async member => {
    const oldInvites = invitesData.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch().catch(() => null);

    if (!oldInvites || !newInvites) return;

    const invite = newInvites.find(i => {
      const old = oldInvites.get(i.code);
      return old && i.uses > old.uses;
    });

    if (invite) {
      const inviter = invite.inviter;

      const user = await client.users.fetch(inviter.id);

      if (!user.invCount) user.invCount = 0;
      user.invCount++;
    }

    invitesData.set(member.guild.id, newInvites);
  });

  // =========================
  // COMMANDS
  // =========================
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {

      // /invites
      if (interaction.commandName === "invites") {
        const user = interaction.user;

        if (!user.invCount) user.invCount = 0;

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📨 Twoje zaproszenia")
              .setDescription(`Masz **${user.invCount}** zaproszeń.`)
          ],
          ephemeral: true
        });
      }

      // /topinvites
      if (interaction.commandName === "topinvites") {

        const users = client.users.cache
          .filter(u => u.invCount)
          .sort((a, b) => b.invCount - a.invCount)
          .first(10);

        let text = "";

        if (!users.length) text = "Brak danych.";

        users.forEach((u, i) => {
          text += `**${i + 1}.** ${u.username} — ${u.invCount}\n`;
        });

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("🏆 Top Invites")
              .setDescription(text)
          ]
        });
      }

    } catch (err) {
      console.log("INVITES ERROR:", err);

      if (!interaction.replied) {
        interaction.reply({
          content: "❌ Błąd komendy.",
          ephemeral: true
        });
      }
    }
  });

};
