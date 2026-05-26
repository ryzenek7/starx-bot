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

  // =====================================
  // CLAIMED TICKETS
  // =====================================
  const claimedTickets = new Map();

  // =====================================
  // INTERACTIONS
  // =====================================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    // =====================================
    // CHECK TICKET
    // =====================================
    const validTicket =
      interaction.channel.name.startsWith("exchange-") ||
      interaction.channel.name.startsWith("buy-") ||
      interaction.channel.name.startsWith("pomoc-") ||
      interaction.channel.name.startsWith("middleman-");

    // =====================================
    // /PRZEJMIJ
    // =====================================
    if (interaction.commandName === "przejmij") {

      try {

        // realizator check
        if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID)) {
          return interaction.reply({
            content: `${EMOJI.warning} Nie jesteś realizatorem.`,
            flags: 64
          });
        }

        // ticket check
        if (!validTicket) {
          return interaction.reply({
            content: `${EMOJI.warning} To nie jest ticket.`,
            flags: 64
          });
        }

        // already claimed
        if (claimedTickets.has(interaction.channel.id)) {
          return interaction.reply({
            content: `${EMOJI.warning} Ticket jest już przejęty.`,
            flags: 64
          });
        }

        // =====================================
        // HIDE REALIZATOR ROLE
        // =====================================
        await interaction.channel.permissionOverwrites.edit(
          REALIZATOR_ROLE_ID,
          {
            ViewChannel: false
          }
        );

        // =====================================
        // ADD CLAIMER ACCESS
        // =====================================
        await interaction.channel.permissionOverwrites.edit(
          interaction.user.id,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            ManageMessages: true
          }
        );

        // save
        claimedTickets.set(
          interaction.channel.id,
          interaction.user.id
        );

        // embed
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

        // realizator check
        if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID)) {
          return interaction.reply({
            content: `${EMOJI.warning} Nie jesteś realizatorem.`,
            flags: 64
          });
        }

        // ticket check
        if (!validTicket) {
          return interaction.reply({
            content: `${EMOJI.warning} To nie jest ticket.`,
            flags: 64
          });
        }

        // restore realizator role
        await interaction.channel.permissionOverwrites.edit(
          REALIZATOR_ROLE_ID,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            ManageMessages: true
          }
        );

        // remove claimer overwrite
        await interaction.channel.permissionOverwrites.delete(
          interaction.user.id
        ).catch(() => {});

        // remove claim
        claimedTickets.delete(interaction.channel.id);

        // embed
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
