const {
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // =====================================
    // CONFIG
    // =====================================
    const LEGIT_CHANNEL_ID = "1500893110048133253";
    const STAFF_ROLE_ID = "1500930428993933373";

    // =====================================
    // EMOJI
    // =====================================
    const EMOJI = {
        money: "<a:money:1501685438103031920>",
        warning: "<:warning:1501693444030992395>",
        pin: "<:pin:1501697389050986546>",
        zap: "<:zap:1501697151737139350>",
        lock: "<:lock:1501697222901895258>"
    };

    // =====================================
    // INTERACTION CREATE
    // =====================================
    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =====================================
            // /LC COMMAND
            // =====================================
            if (
                interaction.isChatInputCommand() &&
                interaction.commandName === "lc"
            ) {

                // STAFF CHECK
                if (
                    !interaction.member.roles.cache.has(STAFF_ROLE_ID)
                ) {

                    return interaction.reply({
                        content: `${EMOJI.warning} Brak permisji.`,
                        ephemeral: true
                    });
                }

                // =====================================
                // SELECT MENU
                // =====================================
                const menu =
                    new StringSelectMenuBuilder()
                        .setCustomId("lc_type")
                        .setPlaceholder("Wybierz typ legit check")
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Purchased")
                                .setDescription("Zakup produktu")
                                .setValue("purchased"),

                            new StringSelectMenuOptionBuilder()
                                .setLabel("Exchange")
                                .setDescription("Wymiana metod")
                                .setValue("exchange")
                        );

                const row =
                    new ActionRowBuilder()
                        .addComponents(menu);

                return interaction.reply({
                    content:
                        `${EMOJI.money} Wybierz typ legit check`,
                    components: [row],
                    ephemeral: true
                });
            }

            // =====================================
            // SELECT MENU
            // =====================================
            if (
                interaction.isStringSelectMenu() &&
                interaction.customId === "lc_type"
            ) {

                const type = interaction.values[0];

                // =====================================
                // PURCHASED
                // =====================================
                if (type === "purchased") {

                    const modal =
                        new ModalBuilder()
                            .setCustomId("lc_purchased")
                            .setTitle("StarX Exchange • Purchased");

                    const product =
                        new TextInputBuilder()
                            .setCustomId("product")
                            .setLabel("Produkt")
                            .setPlaceholder("Netflix Premium")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                    const price =
                        new TextInputBuilder()
                            .setCustomId("price")
                            .setLabel("Kwota")
                            .setPlaceholder("20")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                    const payment =
                        new TextInputBuilder()
                            .setCustomId("payment")
                            .setLabel("Metoda płatności")
                            .setPlaceholder("BLIK")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(product),
                        new ActionRowBuilder().addComponents(price),
                        new ActionRowBuilder().addComponents(payment)
                    );

                    return interaction.showModal(modal);
                }

                // =====================================
                // EXCHANGE
                // =====================================
                if (type === "exchange") {

                    const modal =
                        new ModalBuilder()
                            .setCustomId("lc_exchange")
                            .setTitle("StarX Exchange • Exchange");

                    const from =
                        new TextInputBuilder()
                            .setCustomId("from")
                            .setLabel("Z czego")
                            .setPlaceholder("LTC")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                    const to =
                        new TextInputBuilder()
                            .setCustomId("to")
                            .setLabel("Na co")
                            .setPlaceholder("BLIK")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                    const amount =
                        new TextInputBuilder()
                            .setCustomId("amount")
                            .setLabel("Kwota")
                            .setPlaceholder("300")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(from),
                        new ActionRowBuilder().addComponents(to),
                        new ActionRowBuilder().addComponents(amount)
                    );

                    return interaction.showModal(modal);
                }
            }

            // =====================================
            // PURCHASED SUBMIT
            // =====================================
            if (
                interaction.isModalSubmit() &&
                interaction.customId === "lc_purchased"
            ) {

                const product =
                    interaction.fields.getTextInputValue("product");

                const price =
                    interaction.fields.getTextInputValue("price");

                const payment =
                    interaction.fields.getTextInputValue("payment");

                const finalText =
                    `+rep ${interaction.user} Purchased ${product} ${price}PLN [${payment}]`;

                // =====================================
                // CHANNEL
                // =====================================
                const channel =
                    client.channels.cache.get(LEGIT_CHANNEL_ID);

                if (!channel) {
                    return interaction.reply({
                        content:
                            `${EMOJI.warning} Nie znaleziono kanału.`,
                        ephemeral: true
                    });
                }

                // =====================================
                // SEND MESSAGE
                // =====================================
                await channel.send({
                    content: finalText
                });

                // =====================================
                // EMBED
                // =====================================
                const embed =
                    new EmbedBuilder()
                        .setColor("#1b2dff")
                        .setTitle(
                            `${EMOJI.money} StarX Exchange » Legit Check`
                        )
                        .setDescription(
`${EMOJI.pin} Legit został wysłany

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.zap} Treść:

\`\`\`
${finalText}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.lock} Wysłano na <#${LEGIT_CHANNEL_ID}>`
                        )
                        .setFooter({
                            text: "© 2026 StarX Exchange"
                        })
                        .setTimestamp();

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }

            // =====================================
            // EXCHANGE SUBMIT
            // =====================================
            if (
                interaction.isModalSubmit() &&
                interaction.customId === "lc_exchange"
            ) {

                const from =
                    interaction.fields.getTextInputValue("from");

                const to =
                    interaction.fields.getTextInputValue("to");

                const amount =
                    interaction.fields.getTextInputValue("amount");

                const finalText =
                    `+rep ${interaction.user} exchange ${from} to ${to} ${amount}PLN`;

                // =====================================
                // CHANNEL
                // =====================================
                const channel =
                    client.channels.cache.get(LEGIT_CHANNEL_ID);

                if (!channel) {
                    return interaction.reply({
                        content:
                            `${EMOJI.warning} Nie znaleziono kanału.`,
                        ephemeral: true
                    });
                }

                // =====================================
                // SEND MESSAGE
                // =====================================
                await channel.send({
                    content: finalText
                });

                // =====================================
                // EMBED
                // =====================================
                const embed =
                    new EmbedBuilder()
                        .setColor("#1b2dff")
                        .setTitle(
                            `${EMOJI.money} StarX Exchange » Legit Check`
                        )
                        .setDescription(
`${EMOJI.pin} Legit został wysłany

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.zap} Treść:

\`\`\`
${finalText}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.lock} Wysłano na <#${LEGIT_CHANNEL_ID}>`
                        )
                        .setFooter({
                            text: "© 2026 StarX Exchange"
                        })
                        .setTimestamp();

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }

        } catch (err) {

            console.log("❌ LC ERROR:", err);

            try {

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    await interaction.reply({
                        content:
                            `${EMOJI.warning} Wystąpił błąd.`,
                        ephemeral: true
                    });
                }

            } catch {}
        }
    });
};
