const { Events } = require("discord.js");

module.exports = (client) => {

  let invites = new Map();

  client.once(Events.ClientReady, async () => {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const data = await guild.invites.fetch();
    invites.set(guild.id, data);

    console.log("✅ Invites loaded");
  });

  client.on(Events.GuildMemberAdd, async member => {
    const guild = member.guild;

    const oldInvites = invites.get(guild.id);
    const newInvites = await guild.invites.fetch();

    invites.set(guild.id, newInvites);

    const usedInvite = newInvites.find(inv =>
      oldInvites.get(inv.code)?.uses < inv.uses
    );

    if (!usedInvite) return;

    console.log(`${member.user.tag} joined by ${usedInvite.inviter.tag}`);
  });

};
