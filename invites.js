// invites.js STARX EXCHANGE PREMIUM V2

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const inviteCache = new Map();
  const personalInvites = new Map(); // code => ownerId

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

      console.log("✅ Invite System V2 Loaded");

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

      // link usera
      if (personalInvites.has(usedInvite.code)) {
        ownerId = personalInvites.get(usedInvite.code);
      }

      // zwykły invite
      else if (usedInvite.inviter) {
        ownerId = usedInvite.inviter.id;
      }

      if (!ownerId) return;

      const key = `invites_${guild.id}_${ownerId}`;
      client[key] = (client[key] || 0) + 1;

    } catch (err) {
      console.log("❌ Join Error:", err);
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

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("🔗 StarX Exchange » TWÓJ LINK")
              .setDescription(
`👤 ${interaction.user}

📨 Twój link zaproszenia:

https://discord.gg/${invite.code}`
              )
              .setFooter({
                text: "© 2026 StarX Exchange"
              })
          ],
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

Zaprosiłeś **${amount}** osób.`
              )
              .setFooter({
                text: "© 2026 StarX Exchange"
              })
          ],
          flags: 64
        });
      }

      // ======================
      // /topinvites
      // ======================
      if (interaction.commandName === "topinvites") {

        const members = interaction.guild.members.cache.map(m => ({
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
              .setFooter({
                text: "© 2026 StarX Exchange"
              })
          ]
        });
      }

    } catch (err) {
      console.log("❌ Invite Command Error:", err);
    }
  });

};
