// invites.js FINAL PREMIUM

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const ALLOWED_ROLE_ID = "1499521304146083954"; // rola użytkownik
  const inviteCache = new Map();

  // =====================
  // READY
  // =====================
  client.once(Events.ClientReady, async () => {
    try {
      for (const guild of client.guilds.cache.values()) {
        const invites = await guild.invites.fetch();
        inviteCache.set(
          guild.id,
          new Map(invites.map(inv => [inv.code, inv.uses]))
        );
      }

      console.log("✅ Invite system załadowany");
    } catch (err) {
      console.log("❌ Invite Ready Error:", err);
    }
  });

  // =====================
  // JOIN TRACKER
  // =====================
  client.on(Events.GuildMemberAdd, async member => {
    try {
      const guild = member.guild;

      const oldInvites = inviteCache.get(guild.id) || new Map();
      const newInvites = await guild.invites.fetch();

      const usedInvite = newInvites.find(inv => {
        const oldUses = oldInvites.get(inv.code) || 0;
        return inv.uses > oldUses;
      });

      inviteCache.set(
        guild.id,
        new Map(newInvites.map(inv => [inv.code, inv.uses]))
      );

      if (!usedInvite) return;

      const inviter = usedInvite.inviter;
      if (!inviter) return;

      const key = `invites_${guild.id}_${inviter.id}`;
      const current = client[key] || 0;

      client[key] = current + 1;

    } catch (err) {
      console.log("❌ Join Invite Error:", err);
    }
  });

  // =====================
  // COMMANDS
  // =====================
  client.on(Events.InteractionCreate, async interaction => {
    try {
      if (!interaction.isChatInputCommand()) return;

      if (
        interaction.commandName !== "invites" &&
        interaction.commandName !== "topinvites"
      ) return;

      if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      // /invites
      if (interaction.commandName === "invites") {
        const amount =
          client[`invites_${interaction.guild.id}_${interaction.user.id}`] || 0;

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🌟 StarX Exchange » INVITES")
          .setDescription(
`👤 ${interaction.user}

📨 Zaprosiłeś **${amount}** osób.`
          )
          .setFooter({
            text: "© 2026 StarX Exchange"
          });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

      // /topinvites
      if (interaction.commandName === "topinvites") {

        const members = interaction.guild.members.cache.map(m => {
          return {
            user: m.user,
            invites:
              client[`invites_${interaction.guild.id}_${m.id}`] || 0
          };
        });

        const sorted = members
          .sort((a, b) => b.invites - a.invites)
          .slice(0, 10);

        let desc = "";

        sorted.forEach((u, i) => {
          desc += `**${i + 1}.** ${u.user} — **${u.invites}** zaproszeń\n`;
        });

        if (!desc) desc = "Brak danych.";

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🏆 StarX Exchange » TOP INVITES")
          .setDescription(desc)
          .setFooter({
            text: "© 2026 StarX Exchange"
          });

        return interaction.reply({
          embeds: [embed]
        });
      }

    } catch (err) {
      console.log("❌ Invite Command Error:", err);
    }
  });

};
