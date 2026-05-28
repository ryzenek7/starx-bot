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
    const REP_CHANNEL_ID = "1500893110048133253";
    const CLIENT_ROLE_ID = "1499572498604363918";
    const RYZEN_ID = "1330652001075335300";

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
    // ROLE FUNCTION
    // =========================
    async function giveClientRole(interaction) {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (member) {
            await member.roles.add(CLIENT_ROLE_ID).catch(() => {});
        }
    }

    // =========================
    // MAIN EVENT
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
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Purchased")
                            .setValue("purchased"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("Exchange")
                            .setValue("exchange"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("Contest")
                            .setValue("contest")
                    );

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
                                .setCustomId("product")
                                .setLabel("Produkt")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("price")
                                .setLabel("Kwota")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("payment")
                                .setLabel("Metoda płatności")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                // =========================
                // EXCHANGE
                // =========================
                if (type === "exchange") {

                    const modal = new ModalBuilder()
                        .setCustomId("lc_exchange")
                        .setTitle("Exchange LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("from")
                                .setLabel("Z czego")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("to")
                                .setLabel("Na co")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("amount")
                                .setLabel("Kwota")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                // =========================
                // CONTEST
                // =========================
                if (type === "contest") {

                    await giveClientRole(interaction);

                    const text = `+rep <@${RYZEN_ID}> konkurs`;

                    const embed = new EmbedBuilder()
                        .setColor("#1b2dff")
                        .setTitle(`${EMOJI.money} LC CONTEST`)
                        .setDescription(
`${EMOJI.pin} Skopiuj i wklej na <#${REP_CHANNEL_ID}>

\`\`\`
${text}
\`\`\`
`
                        );

                    return interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                }
            }

            // =========================
            // PURCHASED SUBMIT
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_purchased") {

                const product = interaction.fields.getTextInputValue("product");
                const price = interaction.fields.getTextInputValue("price");
                const payment = interaction.fields.getTextInputValue("payment");

                const text = `+rep ${interaction.user} Purchased ${product} ${price}PLN [${payment}]`;

                await giveClientRole(interaction);

                return interaction.reply({
                    content: `${EMOJI.money} Skopiuj i wklej:\n\`\`\`${text}\`\`\``,
                    ephemeral: true
                });
            }

            // =========================
            // EXCHANGE SUBMIT
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_exchange") {

                const from = interaction.fields.getTextInputValue("from");
                const to = interaction.fields.getTextInputValue("to");
                const amount = interaction.fields.getTextInputValue("amount");

                const text = `+rep ${interaction.user} Exchange ${from} to ${to} ${amount}PLN`;

                await giveClientRole(interaction);

                return interaction.reply({
                    content: `${EMOJI.money} Skopiuj i wklej:\n\`\`\`${text}\`\`\``,
                    ephemeral: true
                });
            }

        } catch (err) {
            console.log("LC ERROR:", err);
        }
    });
};
