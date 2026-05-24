const {
  Events,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

  // =====================================
  // ROLE IDS
  // =====================================
  const STAFF_ROLE_ID = "1500930428993933373";

  const ADMIN_ROLES = [
    "1499499185337012377", // owner
    "1499507487647338656"  // support
  ];

  // =====================================
  // EMOJI
  // =====================================
  const EMOJI = {
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>",
    money: "<a:money:1501685438103031920>"
  };

  // =====================================
  // INTERACTION CREATE
  // =====================================
  client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    // =====================================
    // /PRZEJMIJ
    // =====================================
    if (interaction.commandName === "przejmij") {

      // STAFF CHECK
      if (
        !interaction.member.roles.cache.has(
          STAFF_ROLE_ID
        )
      ) {

        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      try {

        const customer =
          interaction.options.getUser(
            "uzytkownik"
          );

        const channel =
          interaction.channel;

        // =================================
        // UKRYJ OWNER + SUPPORT
        // =================================
        for (const roleId of ADMIN_ROLES) {

          await channel.permissionOverwrites.edit(
            roleId,
            {
              ViewChannel: false
            }
          ).catch(() => {});
        }

        // =================================
        // POKAŻ KLIENTOWI
        // =================================
        await channel.permissionOverwrites.edit(
          customer.id,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true
          }
        );

        // =================================
        // POKAŻ REALIZATOROWI
        // =================================
        await channel.permissionOverwrites.edit(
          interaction.user.id,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true,
            ManageMessages: true
          }
        );

        // =================================
        // EMBED
        // =================================
        const embed =
          new EmbedBuilder()

            .setColor("#2b2d31")

            .setTitle(
              `${EMOJI.lock} StarX Exchange » Ticket Przejęty`
            )

            .setDescription(
[
`> ${EMOJI.pin} Ticket przejęty przez ${interaction.user}`,
`> ${EMOJI.zap} Klient: ${customer}`,
``,
`${EMOJI.money} Ticket widzi tylko klient i realizator`
].join("\n")
            )

            .setFooter({
              text:
                "© 2026 StarX Exchange"
            })

            .setTimestamp();

        await interaction.reply({
          embeds: [embed]
        });

      } catch (err) {

        console.log(
          "❌ przejmij error:",
          err
        );

        await interaction.reply({
          content:
            "❌ Wystąpił błąd.",
          flags: 64
        }).catch(() => {});
      }
    }

    // =====================================
    // /ODPRZYJMIJ
    // =====================================
    if (
      interaction.commandName ===
      "odprzyjmij"
    ) {

      // STAFF CHECK
      if (
        !interaction.member.roles.cache.has(
          STAFF_ROLE_ID
        )
      ) {

        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      try {

        const channel =
          interaction.channel;

        // =================================
        // PRZYWRÓĆ OWNER + SUPPORT
        // =================================
        for (const roleId of ADMIN_ROLES) {

          await channel.permissionOverwrites.edit(
            roleId,
            {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true
            }
          ).catch(() => {});
        }

        // =================================
        // EMBED
        // =================================
        const embed =
          new EmbedBuilder()

            .setColor("#57F287")

            .setTitle(
              `${EMOJI.zap} StarX Exchange » Ticket Odprzejęty`
            )

            .setDescription(
[
`> ${EMOJI.pin} Ticket został przywrócony`,
``,
`${EMOJI.money} Administracja ponownie widzi ticket`
].join("\n")
            )

            .setFooter({
              text:
                "© 2026 StarX Exchange"
            })

            .setTimestamp();

        await interaction.reply({
          embeds: [embed]
        });

      } catch (err) {

        console.log(
          "❌ odprzyjmij error:",
          err
        );

        await interaction.reply({
          content:
            "❌ Wystąpił błąd.",
          flags: 64
        }).catch(() => {});
      }
    }
  });
};
