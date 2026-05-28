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

    const STAFF_ROLE_ID = "1500930428993933373";
    const REP_CHANNEL_ID = "1500893110048133253";

    const EMOJI = {

        ticket: "<:TICKET:1501697124734206032>",
        pin: "<:PIN:1501697389050986546>",
        zap: "<:PIORUN:1501697151737139350>",
        lock: "<:ZAMKNIETE:1501697222901895258>",
        warning: "<:PILNE:1501693444030992395>",

        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>",

        blik: "<:blik:1499784231608389742>",
        paypal: "<:paypal:1499784258091483236>",
        crypto: "<:crypto:1499784635201224724>",
        ltc: "<:ltc:1499784285211726014>"
    };

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
                    );

                return interaction.reply({
                    content: `${EMOJI.money} Wybierz typ LC`,
                    components: [new ActionRowBuilder().addComponents(menu)],
                    ephemeral: true
                });
            }

            // =========================
            // MENU
            // =========================
            if (interaction.isStringSelectMenu() && interaction.customId === "lc_type") {

                const type = interaction.values[0];

                // =========================
                // PURCHASED
                // =========================
                if (type === "purchased") {

                    const modal = new ModalBuilder()
                        .setCustomId("lc_purchased")
                        .setTitle("Purchased LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("Produkt / Dane")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                // =========================
                // EXCHANGE (FIX: BLIK itd)
                // =========================
                if (type === "exchange") {

                    const embed = new EmbedBuilder()
                        .setColor("#1b2dff")
                        .setTitle(`${EMOJI.money} EXCHANGE LC`)
                        .setDescription(
`${EMOJI.arrow} Dostępne metody:

- ${EMOJI.blik} BLIK  
- ${EMOJI.paypal} PAYPAL  
- ${EMOJI.crypto} CRYPTO  
- ${EMOJI.ltc} LTC  

👉 Uzupełnij dane w kolejnym kroku`
                        );

                    const modal = new ModalBuilder()
                        .setCustomId("lc_exchange")
                        .setTitle("Exchange LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("Z czego -> Na co / Kwota")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });

                    return interaction.showModal(modal);
                }

                // =========================
                // CONTEST (FIX: KONKURS + BOT SEND)
                // =========================
                if (type === "contest") {

                    const text = `+rep <@${interaction.user.id}> konkurs`;

                    await interaction.channel.send({
                        content:
`${EMOJI.money} KONKURS

\`\`\`
${text}
\`\`\`

👉 Wklej na <#${REP_CHANNEL_ID}>`
                    });

                    return interaction.reply({
                        content: `${EMOJI.money} Konkurs wysłany`,
                        ephemeral: true
                    });
                }
            }

            // =========================
            // PURCHASED SUBMIT
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_purchased") {

                const data = interaction.fields.getTextInputValue("data");

                const text = `+rep ${interaction.user} Purchased ${data}`;

                await interaction.channel.send({
                    content:
`${EMOJI.money} PURCHASED

\`\`\`
${text}
\`\`\``
                });

                return interaction.reply({
                    content: "Wysłano LC",
                    ephemeral: true
                });
            }

            // =========================
            // EXCHANGE SUBMIT (FIX + BLIK INFO)
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_exchange") {

                const data = interaction.fields.getTextInputValue("data");

                const text = `+rep ${interaction.user} Exchange ${data}`;

                await interaction.channel.send({
                    content:
`${EMOJI.money} EXCHANGE

${EMOJI.blik} BLIK | ${EMOJI.paypal} PAYPAL | ${EMOJI.crypto} CRYPTO | ${EMOJI.ltc} LTC

\`\`\`
${text}
\`\`\``
                });

                return interaction.reply({
                    content: "Wysłano LC",
                    ephemeral: true
                });
            }

        } catch (err) {
            console.log("LC ERROR:", err);
        }
    });
};
