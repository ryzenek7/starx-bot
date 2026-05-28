const {
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");

module.exports = (client) => {

    // =========================
    // CONFIG
    // =========================
    const STAFF_ROLE_ID = "1500930428993933373";
    const CLIENT_ROLE_ID = "1499572498604363918";
    const REP_CHANNEL_ID = "1500893110048133253";

    // =========================
    // EMOJI
    // =========================
    const EMOJI = {
        ticket: "<:TICKET:1501697124734206032>",
        pin: "<:PIN:1501697389050986546>",
        zap: "<:PIORUN:1501697151737139350>",
        lock: "<:ZAMKNIETE:1501697222901895258>",
        warning: "<:PILNE:1501693444030992395>",
        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>"
    };

    // =========================
    // GET OWNER FROM TICKET
    // =========================
    function getOwnerFromTicket(channel) {
        if (!channel?.topic) return null;

        // topic: userId:type:username
        const parts = channel.topic.split(":");
        return {
            id: parts[0],
            type: parts[1],
            name: parts[2]
        };
    }

    // =========================
    // MAIN
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =========================
            // /LC COMMAND
            // =========================
            if (interaction.isChatInputCommand() && interaction.commandName === "lc") {

                if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                    return interaction.reply({
                        content: `${EMOJI.warning} Brak permisji.`,
                        ephemeral: true
                    });
                }

                const menu = new StringSelectMenuBuilder()
                    .setCustomId("lc_type")
                    .setPlaceholder("Wybierz typ LC")
                    .addOptions([
                        { label: "Purchased", value: "purchased" },
                        { label: "Exchange", value: "exchange" },
                        { label: "Konkurs", value: "contest" }
                    ]);

                return interaction.reply({
                    content: `${EMOJI.money} Wybierz typ Legit Check`,
                    components: [new ActionRowBuilder().addComponents(menu)],
                    ephemeral: true
                });
            }

            // =========================
            // MENU
            // =========================
            if (interaction.isStringSelectMenu() && interaction.customId === "lc_type") {

                const type = interaction.values[0];

                if (type === "purchased") {
                    const modal = new ModalBuilder()
                        .setCustomId("lc_purchased")
                        .setTitle("Purchased LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("Produkt / usługa")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                if (type === "exchange") {
                    const modal = new ModalBuilder()
                        .setCustomId("lc_exchange")
                        .setTitle("Exchange LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("np. LTC -> BLIK 100PLN")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                if (type === "contest") {

                    const text = `+rep ${interaction.user} konkurs`;

                    const embed = new EmbedBuilder()
                        .setColor("#1b2dff")
                        .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                        .setDescription(
`${EMOJI.pin} **Legit utworzony**

${EMOJI.zap} \`\`\`
${text}
\`\`\`

${EMOJI.arrow} Wklej na <#${REP_CHANNEL_ID}>`
                        );

                    await interaction.channel.send({ embeds: [embed] });

                    return interaction.reply({
                        content: `${EMOJI.money} Wysłano LC.`,
                        ephemeral: true
                    });
                }
            }

            // =========================
            // PURCHASED
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_purchased") {

                const data = interaction.fields.getTextInputValue("data");

                const text = `+rep ${interaction.user} Purchased ${data}`;

                const embed = new EmbedBuilder()
                    .setColor("#1b2dff")
                    .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                    .setDescription(
`${EMOJI.pin} **Legit utworzony**

${EMOJI.zap} \`\`\`
${text}
\`\`\`

${EMOJI.arrow} Wklej na <#${REP_CHANNEL_ID}>`
                    );

                await interaction.channel.send({ embeds: [embed] });

                return interaction.reply({
                    content: `${EMOJI.money} LC wysłany.`,
                    ephemeral: true
                });
            }

            // =========================
            // EXCHANGE
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_exchange") {

                const data = interaction.fields.getTextInputValue("data");

                const text = `+rep ${interaction.user} Exchange ${data}`;

                const embed = new EmbedBuilder()
                    .setColor("#1b2dff")
                    .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                    .setDescription(
`${EMOJI.pin} **Legit utworzony**

${EMOJI.zap} \`\`\`
${text}
\`\`\`

${EMOJI.arrow} Wklej na <#${REP_CHANNEL_ID}>`
                    );

                await interaction.channel.send({ embeds: [embed] });

                return interaction.reply({
                    content: `${EMOJI.money} LC wysłany.`,
                    ephemeral: true
                });
            }

        } catch (err) {
            console.log("LC ERROR:", err);
        }
    });

    // =========================
    // REP HANDLER (NAJWAŻNIEJSZE)
    // =========================
    client.on(Events.MessageCreate, async (message) => {

        try {

            if (message.author.bot) return;
            if (message.channel.id !== REP_CHANNEL_ID) return;

            const guild = message.guild;

            const ticket = guild.channels.cache.find(c => {
                const owner = getOwnerFromTicket(c);
                return owner?.id && message.content.includes(owner.id);
            });

            if (!ticket) return;

            const owner = getOwnerFromTicket(ticket);
            if (!owner?.id) return;

            const member = await guild.members.fetch(owner.id).catch(() => null);

            // =========================
            // REMOVE ACCESS
            // =========================
            await ticket.permissionOverwrites.edit(owner.id, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            }).catch(() => {});

            // =========================
            // GIVE CLIENT ROLE
            // =========================
            if (member) {
                await member.roles.add(CLIENT_ROLE_ID).catch(() => {});
            }

            // =========================
            // INFO MSG IN TICKET
            // =========================
            await ticket.send({
                content: `${EMOJI.lock} Dostęp został odebrany, po wysłaniu repa.`
            }).catch(() => {});

        } catch (err) {
            console.log("REP ERROR:", err);
        }
    });
};
