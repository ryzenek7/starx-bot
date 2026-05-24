const {
  Events,
  EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

  // =====================
  // ROLE IDS
  // =====================
  const STAFF_ROLE_ID = "1500930428993933373"; // realizator

  const SUPPORT_ROLE_ID = "1499507487647338656";

  // tylko prawdziwa administracja (NIE realizator!)
  const ADMIN_ROLES = [
    "1499499185337012377" // owner
  ];

  // =====================
  // EMOJI
  // =====================
  const EMOJI = {
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>",
    money: "<a:money:1501685438103031920>"
  };

  // =====================
  // INTERACTIONS
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    // =====================
    // PRZEJMIJ
    // =====================
    if (interaction.commandName === "przejmij") {

      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie masz permisji (realizator).",
          flags: 64
        });
      }

      try {

        const customer = interaction.options.getUser("uzytkownik");
        const channel = interaction.channel;

        // 🔒 ukryj TYLKO adminów (nie support, nie realizator)
        for (const roleId of ADMIN_ROLES) {
          await channel.permissionOverwrites.edit(roleId, {
            ViewChannel: false
          }).catch(() => {});
        }

        // 👤 klient
        await channel.permissionOverwrites.edit(customer.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          AttachFiles: true
        });

        // 🧑‍💼 realizator (przejmujący)
        await channel.permissionOverwrites.edit(interaction.user.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          AttachFiles: true,
          ManageMessages: true
        });

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle(`${EMOJI.lock} Ticket przejęty`)
          .setDescription(
            `> ${EMOJI.pin} Przejął: ${interaction.user}\n` +
            `> ${EMOJI.zap} Klient: ${customer}`
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });

      } catch (err) {
        console.log("❌ przejmij error:", err);
        return interaction.reply({
          content: "❌ Błąd.",
          flags: 64
        }).catch(() => {});
      }
    }

    // =====================
    // ODPRZYJMIJ
    // =====================
    if (interaction.commandName === "odprzyjmij") {

      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie masz permisji (realizator).",
          flags: 64
        });
      }

      try {

        const channel = interaction.channel;

        // 🔓 przywróć adminów
        for (const roleId of ADMIN_ROLES) {
          await channel.permissionOverwrites.edit(roleId, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          }).catch(() => {});
        }

        const embed = new EmbedBuilder()
          .setColor("#57F287")
          .setTitle(`${EMOJI.zap} Ticket przywrócony`)
          .setDescription(`> ${EMOJI.pin} Administracja odzyskała dostęp`)
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });

      } catch (err) {
        console.log("❌ odprzyjmij error:", err);
        return interaction.reply({
          content: "❌ Błąd.",
          flags: 64
        }).catch(() => {});
      }
    }
  });
};
