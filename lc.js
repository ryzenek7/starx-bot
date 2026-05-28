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
        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>",
        zap: "<:PIORUN:1501697151737139350>",
        lock: "<:ZAMKNIETE:1501697222901895258>",
        warning: "<:PILNE:1501693444030992395>"
    };

    // =========================
    // FIND OWNER FROM TICKET NAME
    // buy-hogasty444 -> hogasty444
    // =========================
    function getOwnerFromTicket(channel) {
        const name = channel.name; 
        const parts = name.split("-");
        const username = parts.slice(1).join("-");

        return channel.guild.members.cache.find(m =>
            m.user.username.toLowerCase() === username.toLowerCase()
        );
    }

    // =========================
    // MAIN HANDLER
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =========================
            // /LC COMMAND
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
                    .addOptions([
                        { label: "Purchased", value: "purchased" },
                        { label: "Exchange", value: "exchange" },
                        { label: "Konkurs", value: "contest" }
                    ]);

                return interaction.reply({
                    content: `${EMOJI.money} Wybierz typ LC`,
                    components: [new ActionRowBuilder().addComponents(menu)],
                    ephemeral: true
                });
            }

            // =========================
            // SELECT MENU
            // =========================
            if (interaction.isStringSelectMenu() && interaction.customId === "lc_type") {

                const type = interaction.values[0];

                const modal = new ModalBuilder()
                    .setCustomId(`lc_${type}`)
                    .setTitle("Legit Check");

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("data")
                            .setLabel("Wpisz dane")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }

            // =========================
            // HANDLE LC
            // =========================
            async function handleLC(type, data) {

                const repChannel = interaction.guild.channels.cache.get(REP_CHANNEL_ID);

                const content = `+rep ${interaction.user.username} ${type} ${data}`;

                // PUBLIC EMBED (ticket)
                await interaction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#1b2dff")
                            .setTitle(`${EMOJI.money} LEGIT CHECK`)
                            .setDescription(
`${EMOJI.zap} Typ: **${type}**

${EMOJI.arrow} Dane:
\`\`\`${data}\`\`\``
                            )
                    ]
                });

                // REP CHANNEL
                await repChannel.send({ content });

                // OWNER FROM NAME
                const owner = getOwnerFromTicket(interaction.channel);

                if (owner) {

                    // GIVE ROLE
                    await owner.roles.add(CLIENT_ROLE_ID).catch(() => {});

                    // REMOVE ACCESS
                    await interaction.channel.permissionOverwrites.edit(owner.id, {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false
                    });

                    await interaction.channel.send({
                        content: `${EMOJI.lock} Dostęp odebrany: ${owner}`
                    });
                }

                return interaction.reply({
                    content: `${EMOJI.money} LC zakończony`,
                    ephemeral: true
                });
            }

            // =========================
            // MODALS
            // =========================
            if (interaction.isModalSubmit()) {

                const data = interaction.fields.getTextInputValue("data");

                if (interaction.customId === "lc_purchased") {
                    return handleLC("PURCHASED", data);
                }

                if (interaction.customId === "lc_exchange") {
                    return handleLC("EXCHANGE", data);
                }

                if (interaction.customId === "lc_contest") {
                    return handleLC("CONTEST", data);
                }
            }

        } catch (err) {
            console.log("LC ERROR:", err);
        }
    });
};
