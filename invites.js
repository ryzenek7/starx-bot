// invites.js PREMIUM STARX EXCHANGE

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const ALLOWED_ROLE_ID = "1499521304146083954"; // użytkownik
  const inviteCache = new Map();
  const inviteStats = new Map();

  // ===============================
  // READY
  // ===============================
  client.once(Events.ClientReady, async () => {
    try {
      for (const guild of client.guilds.cache.values()) {
        const invites = await guild.invites.fetch();

        inviteCache.set(
          guild.id,
          new Map(invites.map(inv => [inv.code, inv.uses]))
        );
      }

      console.log("✅ StarX Invite System loaded");

    } catch (err) {
      console.log("❌ Invite Ready Error:", err);
    }
  });

  // ===============================
  // JOIN TRACKER
  // ===============================
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
      if (!usedInvite.inviter) return;

      const inviterId = usedInvite.inviter.id;

      const key = `${guild.id}_${inviterId}`;
      const current = inviteStats.get(key) || 0;

      inviteStats.set(key, current + 1);

      console.log(
        `📨 ${member.user.tag} joined via ${usedInvite.inviter.tag}`
      );

    } catch (err) {
      console.log("❌ Join Invite Error:", err);
    }
  });

  // ===============================
  // INTERACTIONS
  // ===============================
  client.on(Events.InteractionCreate, async interaction => {
    try {
      if (!interaction.isChatInputCommand()) return;

      if (
        interaction.commandName !== "invites" &&
        interaction.commandName !== "topinvites" &&
        interaction.commandName !== "myinvite"
      ) return;

      if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      // ===================================
      // /invites
      // ===================================
      if (interaction.commandName === "invites") {

        const key =
          `${interaction.guild.id}_${interaction.user.id}`;

        const amount = inviteStats.get(key) || 0;

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🌟 StarX Exchange » TWOJE INVITES")
          .setDescription(
`👤 ${interaction.user}

📨 Zaprosiłeś **${amount}** osób na serwer.`
          )
          .setFooter({
            text: "© 2026 StarX Exchange"
          });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

      // ===================================
      // /topinvites
      // ===================================
      if (interaction.commandName === "topinvites") {

        const members = interaction.guild.members.cache.map(m => {
          return {
            user: m.user,
            amount:
              inviteStats.get(
                `${interaction.guild.id}_${m.id}`
              ) || 0
          };
        });

        const sorted = members
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        let desc = "";

        sorted.forEach((u, i) => {
          if (u.amount <= 0) return;

          desc += `**${i + 1}.** ${u.user} — **${u.amount}** osób\n`;
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

      // ===================================
      // /myinvite
      // ===================================
      if (interaction.commandName === "myinvite") {

        const channel =
          interaction.guild.systemChannel ||
          interaction.guild.channels.cache
            .filter(c => c.isTextBased())
            .first();

        if (!channel) {
          return interaction.reply({
            content: "❌ Nie znaleziono kanału.",
            flags: 64
          });
        }

        const invite = await channel.createInvite({
          maxAge: 0,
          maxUses: 0,
          unique: true,
          reason: `Invite for ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🔗 StarX Exchange » TWÓJ LINK")
          .setDescription(
`👤 ${interaction.user}

📨 Twój prywatny link:

https://discord.gg/${invite.code}`
          )
          .setFooter({
            text: "© 2026 StarX Exchange"
          });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

    } catch (err) {
      console.log("❌ Invite Command Error:", err);
    }
  });

};
