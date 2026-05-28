const {
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionsBitField,
    ChannelType,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = (client) => {

    // =====================================
    // CONFIG
    // =====================================
    const STAFF_ROLE_ID = "1500930428993933373";
    const REP_CHANNEL_ID = "1500893110048133253";
    const CLIENT_ROLE_ID = "1499572498604363918";

    // =====================================
    // EMOJI
    // =====================================
    const EMOJI = {
        ticket: "<:TICKET:1501697124734206032>",
        pin: "<:PIN:1501697389050986546>",
        zap: "<:PIORUN:1501697151737139350>",
        lock: "<:ZAMKNIETE:1501697222901895258>",
        warning: "<:PILNE:1501693444030992395>",
        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>"
    };

    // =====================================
    // LC COMMAND
    // =====================================
    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =========================
            // /LC
            // =========================
            if (interaction.isChatInputCommand() && interaction.commandName === "lc") {

                if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                    return interaction.reply({
                        content: `${EMOJI.warning} Brak permisji`,
                        ephemeral: true
                    });
                }

                const menu = new StringSelectMenuBuilder()
                    .setCustomId("lc_type")
                    .setPlaceholder("Wybierz typ LC")
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setLabel("Purchased").setValue("purchased"),
                        new StringSelectMenuOptionBuilder().setLabel("Exchange").setValue("exchange"),
                        new StringSelectMenuOptionBuilder().setLabel("Contest").setValue("contest")
                    );

                return interaction.reply({
                    content: `${EMOJI.money} Wybierz typ`,
                    components: [new ActionRowBuilder().addComponents(menu)],
                    ephemeral: true
                });
            }

            // =========================
            // SELECT MENU
            // =========================
            if (interaction.isStringSelectMenu() && interaction.customId === "lc_type") {

                const type = interaction.values[0];

                const existing = interaction.guild.channels.cache.find(c =>
                    c.topic?.startsWith(interaction.user.id)
                );

                if (existing) {
                    return interaction.reply({
                        content: `${EMOJI.warning} Masz już ticket`,
                        ephemeral: true
                    });
                }

                // =========================
                // CONTEST (bez ticketa)
                // =========================
                if (type === "contest") {

                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    if (member) await member.roles.add(CLIENT_ROLE_ID).catch(() => {});

                    const text = `+rep ${interaction.user} konkurs`;

                    return interaction.reply({
                        content: `${EMOJI.money} Skopiuj i wklej na <#${REP_CHANNEL_ID}>:\n\`\`\`${text}\`\`\``,
                        ephemeral: true
                    });
                }

                // =========================
                // MODAL
                // =========================
                const modal = new ModalBuilder()
                    .setCustomId(`lc_${type}`)
                    .setTitle("StarX LC");

                const input = new TextInputBuilder()
                    .setCustomId("data")
                    .setLabel("Wpisz dane")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));

                return interaction.showModal(modal);
            }

            // =========================
            // MODAL SUBMIT
            // =========================
            if (interaction.isModalSubmit()) {

                const type = interaction.customId.split("_")[1];
                const data = interaction.fields.getTextInputValue("data");

                const channel = await interaction.guild.channels.create({
                    name: `lc-${interaction.user.username}`.toLowerCase(),
                    topic: `${interaction.user.id}:${type}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages
                            ]
                        },
                        {
                            id: STAFF_ROLE_ID,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });

                const member = interaction.guild.members.cache.get(interaction.user.id);
                if (member) await member.roles.add(CLIENT_ROLE_ID).catch(() => {});

                const text = `+rep ${interaction.user} ${type} ${data}`;

                const embed = new EmbedBuilder()
                    .setColor("#1b2dff")
                    .setTitle(`${EMOJI.ticket} LC SYSTEM`)
                    .setDescription(`\`\`\`${text}\`\`\`\nSkopiuj i wklej na <#${REP_CHANNEL_ID}>`);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("close_ticket")
                        .setLabel("Zamknij")
                        .setStyle(ButtonStyle.Danger)
                );

                await channel.send({
                    content: `${interaction.user} <@&${STAFF_ROLE_ID}>`,
                    embeds: [embed],
                    components: [row]
                });

                return interaction.reply({
                    content: `${EMOJI.ticket} Ticket: ${channel}`,
                    ephemeral: true
                });
            }

            // =========================
            // CLOSE TICKET
            // =========================
            if (interaction.isButton() && interaction.customId === "close_ticket") {

                if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                    return interaction.reply({
                        content: `${EMOJI.warning} Brak permisji`,
                        ephemeral: true
                    });
                }

                return interaction.channel.delete().catch(() => {});
            }

        } catch (err) {
            console.log(err);
        }
    });

    // =====================================
    // REP AUTO REMOVE ACCESS
    // =====================================
    client.on(Events.MessageCreate, async (message) => {

        try {

            if (message.author.bot) return;
            if (message.channel.id !== REP_CHANNEL_ID) return;

            const ticket = message.guild.channels.cache.find(c =>
                c.topic?.startsWith(message.author.id)
            );

            if (!ticket) return;

            await ticket.permissionOverwrites.edit(message.author.id, {
                ViewChannel: false
            });

            await ticket.send({
                content: `${EMOJI.lock} Dostęp odebrany po rep`
            });

        } catch (err) {
            console.log(err);
        }
    });
};
