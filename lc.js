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
    const CLIENT_ROLE_ID = "1499572498604363918";
    const REP_CHANNEL_ID = "1500893110048133253";

    const EMOJI = {
        ticket: "<:TICKET:1501697124734206032>",
        pin: "<:PIN:1501697389050986546>",
        zap: "<:PIORUN:1501697151737139350>",
        lock: "<:ZAMKNIETE:1501697222901895258>",
        warning: "<:PILNE:1501693444030992395>",
        support: "<:WSPARCIE:1500243961124618381>",
        admin: "<:ADM:1501989271077388500>",
        list: "<:LIST:1501693215328440370>",
        clock: "<:CZAS:1502030015943151868>",

        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>",
        nitro: "<a:nitro:1501684762601848963>",

        blik: "<:blik:1499784231608389742>",
        paypal: "<:paypal:1499784258091483236>",
        crypto: "<:crypto:1499784635201224724>",
        ltc: "<:ltc:1499784285211726014>"
    };

    // =========================
    // helper: extract username like buy-hogasty444 -> hogasty444
    // =========================
    function extractUsername(tag) {
        if (!tag) return null;
        const match = tag.match(/buy-([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    }

    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =========================
            // /LC
            // =========================
            if (interaction.isChatInputCommand() && interaction.commandName === "lc") {

                if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                    return interaction.reply({
                        content: `${EMOJI.warning} Nie masz permisji.`,
                        ephemeral: true
                    });
                }

                // ✅ GIVE CLIENT ROLE (USER WHO USED /LC)
                const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
                if (member) {
                    await member.roles.add(CLIENT_ROLE_ID).catch(() => {});
                }

                const menu = new StringSelectMenuBuilder()
                    .setCustomId("lc_type")
                    .setPlaceholder("Wybierz typ legit check")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Purchased")
                            .setValue("purchased"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Exchange")
                            .setValue("exchange"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Konkurs")
                            .setValue("contest")
                    );

                return interaction.reply({
                    content: `${EMOJI.money} Wybierz typ legit check`,
                    components: [new ActionRowBuilder().addComponents(menu)],
                    ephemeral: true
                });
            }

            // =========================
            // SELECT MENU
            // =========================
            if (interaction.isStringSelectMenu() && interaction.customId === "lc_type") {

                const type = interaction.values[0];

                if (type === "purchased") {
                    const modal = new ModalBuilder()
                        .setCustomId("lc_purchased")
                        .setTitle("Purchased LC");

                    const product = new TextInputBuilder()
                        .setCustomId("product")
                        .setLabel("Produkt")
                        .setStyle(TextInputStyle.Short);

                    const price = new TextInputBuilder()
                        .setCustomId("price")
                        .setLabel("Kwota")
                        .setStyle(TextInputStyle.Short);

                    const payment = new TextInputBuilder()
                        .setCustomId("payment")
                        .setLabel("Metoda")
                        .setStyle(TextInputStyle.Short);

                    return interaction.showModal(
                        modal.addComponents(
                            new ActionRowBuilder().addComponents(product),
                            new ActionRowBuilder().addComponents(price),
                            new ActionRowBuilder().addComponents(payment)
                        )
                    );
                }

                if (type === "exchange") {
                    const modal = new ModalBuilder()
                        .setCustomId("lc_exchange")
                        .setTitle("Exchange LC");

                    const from = new TextInputBuilder().setCustomId("from").setLabel("Z").setStyle(TextInputStyle.Short);
                    const to = new TextInputBuilder().setCustomId("to").setLabel("Na").setStyle(TextInputStyle.Short);
                    const amount = new TextInputBuilder().setCustomId("amount").setLabel("Kwota").setStyle(TextInputStyle.Short);

                    return interaction.showModal(
                        modal.addComponents(
                            new ActionRowBuilder().addComponents(from),
                            new ActionRowBuilder().addComponents(to),
                            new ActionRowBuilder().addComponents(amount)
                        )
                    );
                }

                if (type === "contest") {

                    const text = `+rep ${interaction.user} konkurs`;

                    await interaction.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("#1b2dff")
                                .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                                .setDescription(`${EMOJI.pin} **Legit utworzony**\n\`\`\`${text}\`\`\``)
                        ]
                    });

                    return interaction.reply({
                        content: `${EMOJI.money} Legit został wysłany.`,
                        ephemeral: true
                    });
                }
            }

            // =========================
            // PURCHASED
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_purchased") {

                const product = interaction.fields.getTextInputValue("product");
                const price = interaction.fields.getTextInputValue("price");
                const payment = interaction.fields.getTextInputValue("payment");

                const text = `+rep ${interaction.user} Purchased ${product} ${price}PLN [${payment}]`;

                await interaction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#1b2dff")
                            .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                            .setDescription(`${EMOJI.pin} **Legit utworzony**\n\`\`\`${text}\`\`\``)
                    ]
                });

                return interaction.reply({
                    content: `${EMOJI.money} Legit został wysłany.`,
                    ephemeral: true
                });
            }

            // =========================
            // EXCHANGE
            // =========================
            if (interaction.isModalSubmit() && interaction.customId === "lc_exchange") {

                const from = interaction.fields.getTextInputValue("from");
                const to = interaction.fields.getTextInputValue("to");
                const amount = interaction.fields.getTextInputValue("amount");

                const text = `+rep ${interaction.user} Exchange ${from} to ${to} ${amount}PLN`;

                await interaction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#1b2dff")
                            .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                            .setDescription(`${EMOJI.pin} **Legit utworzony**\n\`\`\`${text}\`\`\``)
                    ]
                });

                return interaction.reply({
                    content: `${EMOJI.money} Legit został wysłany.`,
                    ephemeral: true
                });
            }

        } catch (err) {
            console.log(err);
        }
    });

    // =========================
    // REMOVE TICKET ACCESS AFTER REP
    // =========================
    client.on(Events.MessageCreate, async (message) => {

        if (message.author.bot) return;
        if (message.channel.id !== REP_CHANNEL_ID) return;

        const guild = message.guild;

        // find ticket by topic (buy-hogasty444 etc)
        const ticket = guild.channels.cache.find(c =>
            c.topic && c.topic.includes(message.author.id)
        );

        if (!ticket) return;

        await ticket.permissionOverwrites.edit(message.author.id, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        }).catch(() => {});
    });
};
