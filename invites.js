// invites.js STARX EXCHANGE V5 FINAL + DISCOUNT ROLES

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const inviteCache = new Map();
  const personalInvites = new Map();

  // ==========================
  // CONFIG
  // ==========================
  const LOG_CHANNEL_ID = "1500261480212205629";

  const ROLE_5 = "1500270028635771032";   // -5%
  const ROLE_10 = "1500270005646786670";  // -10%

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

      const total = client[key];

      // =====================
      // AUTO RANGI
      // =====================
      const inviterMember = await guild.members.fetch(ownerId).catch(() => null);

      if (inviterMember) {

        // 20 zaproszeń = -10%
        if (total >= 20) {

          if (!inviterMember.roles.cache.has(ROLE_10)) {
            await inviterMember.roles.add(ROLE_10).catch(() => {});
          }

          if (inviterMember.roles.cache.has(ROLE_5)) {
            await inviterMember.roles.remove(ROLE_5).catch(() => {});
          }
        }

        // 10 zaproszeń = -5%
        else if (total >= 10) {

          if (!inviterMember.roles.cache.has(ROLE_5)) {
            await inviterMember.roles.add(ROLE_5).catch(() => {});
          }
        }
      }

      // =====================
      // LOG KANAŁ
      // =====================
      const logChannel = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);

      if (logChannel) {
        const inviter = await client.users.fetch(ownerId).catch(() => null);

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("🥷 StarX Exchange » NOWE ZAPROSZENIE")
          .setDescription(
`👤 **Nowy użytkownik:** ${member}

📨 **Zaprosił:** ${inviter}

📈 **Łącznie zaproszeń:** **${total}**

🎁 **Nagrody:**
10 osób = <@&${ROLE_5}>
20 osób = <@&${ROLE_10}>

🔗 Kod: \`${usedInvite.code}\``)
          .setFooter({
            text: "Komendy: /invites • /myinvite • /topinvites • /checkinvites"
          })
          .setTimestamp();

        await logChannel.send({
          embeds: [embed]
        });
      }

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

https://discord.gg/${invite.code}`)
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

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📨 StarX Exchange » INVITES")
              .setDescription(
`👤 ${interaction.user}

Zaprosiłeś **${amount}** osób.`)
          ],
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

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📨 StarX Exchange » CHECK INVITES")
              .setDescription(
`👤 ${user}

Posiada **${amount}** zaproszeń.`)
          ],
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

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("🏆 StarX Exchange » TOP INVITES")
              .setDescription(desc)
          ]
        });
      }

    } catch (err) {
      console.log("❌ Invite Command Error:", err);
    }
  });

};
