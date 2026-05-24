const {
  Events,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

  const REALIZATOR_ROLE_ID = "1500930428993933373";

  const EMOJI = {
    warning: "<:warning:1501693444030992395>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>"
  };

  // przejęte tickety
  const claimedTickets = new Map();

  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    // =====================================
    // /PRZEJMIJ
    // =====================================
    if (interaction.commandName === "przejmij") {

      try {

        if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID)) {
          return interaction.reply({
            content: `${EMOJI.warning} Nie jesteś realizatorem.`,
            flags: 64
          });
        }

        const user = interaction.options.getUser("uzytkownik");

        if (!interaction.channel.name.startsWith("ticket-")) {
          return interaction.reply({
            content: `${EMOJI.warning} To nie jest ticket.`,
            flags: 64
          });
        }

        // czy ticket już przejęty
        if (claimedTickets.has(interaction.channel.id)) {
          return interaction.reply({
            content: `${EMOJI.warning} Ticket jest już przejęty.`,
            flags: 64
          });
        }

        // zabierz widoczność realizatorom
        await interaction.channel.permissionOverwrites.edit(
          REALIZATOR_ROLE_ID,
          {
            ViewChannel: false
          }
        );

        // dodaj dostęp przejmującemu
        await interaction.channel.permissionOverwrites.edit(
          interaction.user.id,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            ManageMessages: true
          }
        );

        claimedTickets.set(interaction.channel.id, interaction.user.id);

        const embed = new EmbedBuilder()
          .setColor("#57F287")
          .setDescription(
            `${EMOJI.zap} Ticket został przejęty przez ${interaction.user}`
          );

        return interaction.reply({
          embeds: [embed]
        });

      } catch (err) {
        console.log("❌ /przejmij error:", err);
      }
    }

    // =====================================
    // /ODPRZYJMIJ
    // =====================================
    if (interaction.commandName === "odprzyjmij") {

      try {

        if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID)) {
          return interaction.reply({
            content: `${EMOJI.warning} Nie jesteś realizatorem.`,
            flags: 64
          });
        }

        if (!interaction.channel.name.startsWith("ticket-")) {
          return interaction.reply({
            content: `${EMOJI.warning} To nie jest ticket.`,
            flags: 64
          });
        }

        // przywróć rolę realizatorów
        await interaction.channel.permissionOverwrites.edit(
          REALIZATOR_ROLE_ID,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            ManageMessages: true
          }
        );

        // usuń przejmującego
        await interaction.channel.permissionOverwrites.delete(
          interaction.user.id
        ).catch(() => {});

        claimedTickets.delete(interaction.channel.id);

        const embed = new EmbedBuilder()
          .setColor("#FEE75C")
          .setDescription(
            `${EMOJI.lock} Ticket został oddany przez ${interaction.user}`
          );

        return interaction.reply({
          embeds: [embed]
        });

      } catch (err) {
        console.log("❌ /odprzyjmij error:", err);
      }
    }
  });
};
