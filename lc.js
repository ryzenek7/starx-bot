```js
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

    // =====================================
    // CONFIG
    // =====================================
    const LEGIT_CHANNEL_ID = "1500893110048133253";
    const STAFF_ROLE_ID = "1500930428993933373";

    // =====================================
    // EMOJI
    // =====================================
    const EMOJI = {

        // SYSTEM
        ticket: "<:ticket:1501697124734206032>",
        pin: "<:pin:1501697389050986546>",
        zap: "<:zap:1501697151737139350>",
        lock: "<:lock:1501697222901895258>",
        warning: "<:warning:1501693444030992395>",
        support: "<:support:1500243961124618381>",
        admin: "<:admin:1501989271077388500>",
        list: "<:list:1501693215328440370>",
        clock: "<:clock:1502030015943151868>",

        // MONEY
        money: "<a:money:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>",
        nitro: "<a:nitro:1501684762601848963>",

        // PAYMENTS
        blik: "<:blik:1499784231608389742>",
        paypal: "<:paypal:1499784258091483236>",
        crypto: "<:crypto:1499784635201224724>",
        ltc: "<:ltc:1499784285211726014>",

        // SHOP
        spotify: "<:Spotify:1500238701718933627>",
        netflix: "<:Netflix:1500238788306403398>",
        ytpremium: "<:ytpremium:1500239415937859605>",
        hbomax: "<:HBOmax:1500239251143524464>",
        crunchyroll: "<:crunchyroll:1501686424158605463>",
        disney: "<:disney:1501686870025699449>",
        primevideo: "<:primevideo:1502001410311716984>",
        chatgpt: "<:chatgpt:1502001751019094097>",
        capcut: "<:capcut:1502002116405887039>",
        cda: "<:cda:1508077411873325076>",

        // VPN
        nordvpn: "<:nordvpn:1501999409343369400>",
        mullvad: "<:mullvad:1501999834159255712>",
        tunnelbear: "<:tunnelbear:1502000450009042984>",

        // SHOP
        middleman: "<:middleman:1500243884733894716>",
        cart: "<:cart:1500243849535033577>",
        box: "<:box:1500243849535033577>",

        prime: "<:primevideo:1502001410311716984>"
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
                        content:
                            `${EMOJI.warning} Brak permisji.`,
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
                            .setPlaceholder(
                                "CDA Premium Lifetime"
                            )
                            .setStyle(
                                TextInputStyle.Short
                            )
                            .setRequired(true);

                    const price =
                        new TextInputBuilder()
                            .setCustomId("price")
                            .setLabel("Kwota")
                            .setPlaceholder("10")
                            .setStyle(
                                TextInputStyle.Short
                            )
                            .setRequired(true);

                    const payment =
                        new TextInputBuilder()
                            .setCustomId("payment")
                            .setLabel("Metoda płatności")
                            .setPlaceholder("BLIK")
                            .setStyle(
                                TextInputStyle.Short
                            )
                            .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder()
                            .addComponents(product),

                        new ActionRowBuilder()
                            .addComponents(price),

                        new ActionRowBuilder()
                            .addComponents(payment)
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
                            .setStyle(
                                TextInputStyle.Short
                            )
                            .setRequired(true);

                    const to =
                        new TextInputBuilder()
                            .setCustomId("to")
                            .setLabel("Na co")
                            .setPlaceholder("BLIK")
                            .setStyle(
                                TextInputStyle.Short
                            )
                            .setRequired(true);

                    const amount =
                        new TextInputBuilder()
                            .setCustomId("amount")
                            .setLabel("Kwota")
                            .setPlaceholder("280")
                            .setStyle(
                                TextInputStyle.Short
                            )
                            .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder()
                            .addComponents(from),

                        new ActionRowBuilder()
                            .addComponents(to),

                        new ActionRowBuilder()
                            .addComponents(amount)
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
                    interaction.fields.getTextInputValue(
                        "product"
                    );

                const price =
                    interaction.fields.getTextInputValue(
                        "price"
                    );

                const payment =
                    interaction.fields.getTextInputValue(
                        "payment"
                    );

                const finalText =
                    `+rep ${interaction.user} Purchased ${product} ${price}PLN [${payment}]`;

                // =====================================
                // SEND TO CHANNEL
                // =====================================
                const channel =
                    client.channels.cache.get(
                        LEGIT_CHANNEL_ID
                    );

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
                            text:
                                "© 2026 StarX Exchange"
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
                    interaction.fields.getTextInputValue(
                        "from"
                    );

                const to =
                    interaction.fields.getTextInputValue(
                        "to"
                    );

                const amount =
                    interaction.fields.getTextInputValue(
                        "amount"
                    );

                const finalText =
                    `+rep ${interaction.user} exchange ${from} to ${to} ${amount}PLN`;

                // =====================================
                // SEND TO CHANNEL
                // =====================================
                const channel =
                    client.channels.cache.get(
                        LEGIT_CHANNEL_ID
                    );

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
                            text:
                                "© 2026 StarX Exchange"
                        })
                        .setTimestamp();

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }

        } catch (err) {

            console.log(
                "❌ LC ERROR:",
                err
            );

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
```
