const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Events,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = (client) => {

  // =========================================
  // CONFIG
  // =========================================
  const PANEL_CHANNEL_ID = "1499512781861556314";

  const SUPPORT_ROLE_ID = "1499507487647338656";

  // ACCESS ROLE
  const TICKET_ACCESS_ROLE_ID = "1502020178026696744";

  // =========================================
  // EMOJIS
  // =========================================
  const EMOJI = {
    ticket: "<:ticket:1501697124734206032>",
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>"
  };

  // =========================================
  // MENU
  // =========================================
  function createMenu() {

    return new ActionRowBuilder().addComponents(

      new StringSelectMenuBuilder()

        .setCustomId("ticket_select")

        .setPlaceholder("🎫 Wybierz kategorię")

        .addOptions([

          {
            label: "Wymiana / Zakup",
            description: "Kupno, sprzedaż, wymiana",
            value: "Wymiana / Zakup",
            emoji: {
              id: "1500243849535033577"
            }
          },

          {
            label: "Pomoc",
            description: "Pomoc techniczna",
            value: "Pomoc",
            emoji: {
              id: "1500243961124618381"
            }
          },

          {
            label: "Middleman",
            description: "Usługa MM",
            value: "Middleman",
            emoji: {
              id: "1500243884733894716"
            }
          }
        ])
    );
  }

  // =========================================
  // READY
  // =========================================
  client.once(Events.ClientReady, async () => {

    try {

      const channel =
        await client.channels.fetch(PANEL_CHANNEL_ID);

      if (!channel) return;

      const embed = new EmbedBuilder()

        .setColor("#2b2d31")

        .setTitle(
          `${EMOJI.ticket} StarX Exchange » TICKETY`
        )

        .setDescription(
          [
            `> ${EMOJI.pin} Wybierz kategorię z menu poniżej`,
            `> ${EMOJI.zap} Szybka odpowiedź supportu`,
            `> ${EMOJI.lock} Bezpieczny kontakt z administracją`
          ].join("\n")
        )

        .setImage(
          "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
        )

        .setThumbnail(
          client.user.displayAvatarURL()
        )

        .setFooter({
          text: "© 2026 StarX Exchange"
        })

        .setTimestamp();

      await channel.send({

        embeds: [embed],

        components: [createMenu()]
      });

      console.log("✅ Panel ticketów wysłany");

    } catch (err) {

      console.log("❌ Ticket panel error:", err);
    }
  });

  // =========================================
  // INTERACTIONS
  // =========================================
  client.on(Events.InteractionCreate, async interaction => {

    // =====================================
    // CREATE TICKET
    // =====================================
    if (interaction.isStringSelectMenu()) {

      if (interaction.customId !== "ticket_select")
        return;

      try {

        const category =
          interaction.values[0];

        // =================================
        // EXISTING CHECK
        // =================================
        const existing =
          interaction.guild.channels.cache.find(
            c =>
              c.name ===
              `ticket-${interaction.user.username}`.toLowerCase()
          );

        if (existing) {

          return interaction.reply({

            content:
              `❌ Masz już otwarty ticket: ${existing}`,

            flags: 64
          });
        }

        // =================================
        // CREATE CHANNEL
        // =================================
        const channel =
          await interaction.guild.channels.create({

            name:
              `ticket-${interaction.user.username}`.toLowerCase(),

            type: ChannelType.GuildText,

            permissionOverwrites: [

              // everyone hidden
              {
                id: interaction.guild.id,

                deny: [
                  PermissionsBitField.Flags.ViewChannel
                ]
              },

              // customer
              {
                id: interaction.user.id,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.AttachFiles
                ]
              },

              // support
              {
                id: SUPPORT_ROLE_ID,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.ManageMessages
                ]
              },

              // access role hidden
              {
                id: TICKET_ACCESS_ROLE_ID,

                deny: [
                  PermissionsBitField.Flags.ViewChannel
                ]
              }
            ]
          });

        // =================================
        // CLOSE BUTTON
        // =================================
        const closeButton =
          new ButtonBuilder()

            .setCustomId("close_ticket")

            .setLabel("Zamknij ticket")

            .setEmoji("1501697222901895258")

            .setStyle(ButtonStyle.Danger);

        const row =
          new ActionRowBuilder()
            .addComponents(closeButton);

        // =================================
        // SEND MESSAGE
        // =================================
        const ticketMessage =
          await channel.send({

            content:
              `<@&${SUPPORT_ROLE_ID}> 👋 ${interaction.user}\n` +
              `${EMOJI.pin} Nowy ticket\n` +
              `${EMOJI.ticket} Kategoria: **${category}**`,

            components: [row],

            allowedMentions: {
              roles: [SUPPORT_ROLE_ID]
            }
          });

        // =================================
        // REMOVE PING
        // =================================
        setTimeout(async () => {

          try {

            await ticketMessage.edit({

              content:
                `👋 ${interaction.user}\n` +
                `${EMOJI.pin} Nowy ticket\n` +
                `${EMOJI.ticket} Kategoria: **${category}**`,

              components: [row]
            });

          } catch {}

        }, 1000);

        // =================================
        // SUCCESS
        // =================================
        const successEmbed =
          new EmbedBuilder()

            .setColor("#57F287")

            .setDescription(
              `${EMOJI.ticket} Ticket został utworzony: ${channel}`
            );

        await interaction.reply({

          embeds: [successEmbed],

          flags: 64
        });

      } catch (err) {

        console.log("❌ Create ticket error:", err);

        if (!interaction.replied) {

          await interaction.reply({

            content:
              "❌ Nie udało się stworzyć ticketa.",

            flags: 64
          });
        }
      }
    }

    // =====================================
    // CLOSE TICKET
    // =====================================
    if (interaction.isButton()) {

      if (interaction.customId !== "close_ticket")
        return;

      try {

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        // =================================
        // SUPPORT CHECK
        // =================================
        if (
          !member.roles.cache.has(SUPPORT_ROLE_ID)
        ) {

          return interaction.reply({

            content:
              "❌ Nie masz permisji support.",

            flags: 64
          });
        }

        // =================================
        // REMOVE ACCESS ROLE
        // =================================
        const accessRole =
          interaction.guild.roles.cache.get(
            TICKET_ACCESS_ROLE_ID
          );

        if (accessRole) {

          for (const member of accessRole.members.values()) {

            await member.roles.remove(
              TICKET_ACCESS_ROLE_ID
            ).catch(() => {});
          }
        }

        // =================================
        // CLOSE EMBED
        // =================================
        const closingEmbed =
          new EmbedBuilder()

            .setColor("#ED4245")

            .setDescription(
              `${EMOJI.lock} Ticket zostanie zamknięty za **3 sekundy**`
            );

        await interaction.reply({

          embeds: [closingEmbed]
        });

        // =================================
        // DELETE CHANNEL
        // =================================
        setTimeout(async () => {

          await interaction.channel
            .delete()
            .catch(() => {});

        }, 3000);

      } catch (err) {

        console.log("❌ Close ticket error:", err);
      }
    }
  });
};
