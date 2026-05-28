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
        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>",
        ticket: "<:TICKET:1501697124734206032>",
        lock: "<:ZAMKNIETE:1501697222901895258>",
        warning: "<:PILNE:1501693444030992395>",
        zap: "<:PIORUN:1501697151737139350>"
    };

    // =========================
    // MENU LC
    // =========================
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
                    .addOptions([
                        {
                            label: "Purchased",
                            value: "purchased"
                        },
                        {
                            label: "Exchange",
                            value: "exchange"
                        },
                        {
                            label: "Konkurs",
                            value: "contest"
                        }
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

                const input = new TextInputBuilder()
                    .setCustomId("data")
                    .setLabel("Wpisz dane")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(input)
                );

                return interaction.showModal(modal);
            }

            // =========================
            // FIND OWNER BY CHANNEL NAME
            // buy-hogasty444 -> hogasty444
            // =========================
            function getOwnerFromChannel(channel) {

                const name = channel.name; // buy-hogasty444

                const parts = name.split("-");

                const username = parts.slice(1).join("-");

                return channel.guild.members.cache.find(
                    m => m.user.username.toLowerCase() === username.toLowerCase()
                );
            }

            // =========================
            // SEND REP + CLOSE ACCESS
            // =========================
            async function handleLC(interaction, type, data) {

                const repChannel = interaction.guild.channels.cache.get(REP_CHANNEL_ID);
                if (!repChannel) return;

                const content =
                    `+rep ${interaction.user.username} ${type} ${data}`;

                // PUBLIC EMBED (na ticket)
                const embed = new EmbedBuilder()
                    .setColor("#1b2dff")
                    .setTitle(`${EMOJI.money} LEGIT CHECK`)
                    .setDescription(
                        `${EMOJI.zap} Wysłano LC\n\n` +
                        `${EMOJI.arrow} Typ: **${type}**\n` +
                        `${EMOJI.arrow} Dane:\n\`\`\`${data}\`\`\``
                    );

                await interaction.channel.send({ embeds: [embed] });

                // REP CHANNEL (publiczny)
                await repChannel.send({
                    content
                });

                // OWNER FROM NAME
                const owner = getOwnerFromChannel(interaction.channel);

                if (owner) {

                    // GIVE CLIENT ROLE
                    await owner.roles.add(CLIENT_ROLE_ID).catch(() => {});

                    // REMOVE ACCESS
                    await interaction.channel.permissionOverwrites.edit(owner.id, {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false
                    });

                    await interaction.channel.send({
                        content:
                            `${EMOJI.lock} Dostęp odebrany dla ${owner}`
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
                    return handleLC(interaction, "PURCHASED", data);
                }

                if (interaction.customId === "lc_exchange") {
                    return handleLC(interaction, "EXCHANGE", data);
                }

                if (interaction.customId === "lc_contest") {
                    return handleLC(interaction, "CONTEST", data);
                }
            }

        } catch (err) {
            console.log("LC ERROR:", err);
        }
    });
};
