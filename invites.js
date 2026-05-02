// invites.js STARX EXCHANGE V3 FINAL

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const inviteCache = new Map();
  const personalInvites = new Map();

  // ==========================
  // READY
  // ==========================
  client.once(Events.ClientReady, async () => {
    try {
      for (const guild of client.guilds.cache.values()) {
        const invites = await guild.invites.fetch();

        inviteCache.set(
          guild.id,
          new Map(invites.map(inv => [inv.code, inv.uses]))
        );
      }

      console.log("✅ Invite system loaded");

    } catch (err) {
      console.log("❌ Invite Ready Error:", err);
    }
  });

  // ==========================
  // JOIN TRACKER
  // ==========================
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

      let ownerId = null;

      if (personalInvites.has(usedInvite.code)) {
        ownerId = personalInvites.get(usedInvite.code);
      } else if (usedInvite.inviter) {
        ownerId = usedInvite.inviter.id;
      }

      if (!ownerId) return;

      const key = `invites_${guild.id}_${ownerId}`;
      client[key] = (client[key] || 0) + 1;

    } catch (err) {
      console.log("❌ Join Invite Error:", err);
    }
  });

  // ==========================
  // COMMANDS
  // ==========================
  client.on(Events.InteractionCreate, async interaction => {
    try {
      if (!interaction.isChatInputCommand()) return;

      // ======================
      // /myinvite
      // ======================
      if (interaction.commandName === "myinvite") {

        const invite = await interaction.channel.createInvite({
          maxAge: 0,
          maxUses: 0,
          unique: true
        });

        personalInvites.set(invite.code, interaction.user.id);

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🔗 StarX Exchange » TWÓJ LINK")
          .setDescription(
`👤 ${interaction.user}

📨 Twój link:

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

      // ======================
      // /invites
      // ======================
      if (interaction.commandName === "invites") {

        const amount =
          client[`invites_${interaction.guild.id}_${interaction.user.id}`] || 0;

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("📨 StarX Exchange » INVITES")
          .setDescription(
`👤 ${interaction.user}

Zaprosiłeś **${amount}** osób.`
          )
          .setFooter({
            text: "© 2026 StarX Exchange"
          });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

      // ======================
      // /checkinvites
      // ======================
      if (interaction.commandName === "checkinvites") {

        const user = interaction.options.getUser("osoba");

        const amount =
          client[`invites_${interaction.guild.id}_${user.id}`] || 0;

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("📨 StarX Exchange » CHECK INVITES")
          .setDescription(
`👤 ${user}

Posiada **${amount}** zaproszeń.`
          )
          .setFooter({
            text: "© 2026 StarX Exchange"
          });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

      // ======================
      // /topinvites
      // ======================
      if (interaction.commandName === "topinvites") {

        const members = interaction.guild.members.cache
          .filter(m => !m.user.bot)
          .map(m => ({
            user: m.user,
            invites:
              client[`invites_${interaction.guild.id}_${m.id}`] || 0
          }));

        const sorted = members
          .filter(x => x.invites > 0)
          .sort((a, b) => b.invites - a.invites)
          .slice(0, 10);

        let desc = "";

        sorted.forEach((x, i) => {
          desc += `**${i + 1}.** ${x.user} — **${x.invites} osób**\n`;
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
