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
        money: "<a:m_:1501685438103031920>",
        arrow: "<a:Arrow_White:1508094625984811038>"
    };

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

                // 🔥 FIX: pewne pobranie membera + gwarantowane nadanie roli
                try {
                    const member = await interaction.guild.members.fetch(interaction.user.id);

                    if (member && !member.roles.cache.has(CLIENT_ROLE_ID)) {
                        await member.roles.add(CLIENT_ROLE_ID);
                    }

                } catch (err) {
                    console.log("ROLE FETCH ERROR:", err);
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
                        .setTitle("StarX Exchange • Purchased");

                    const product = new TextInputBuilder()
                        .setCustomId("product")
                        .setLabel("Produkt")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const price = new TextInputBuilder()
                        .setCustomId("price")
                        .setLabel("Kwota")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const payment = new TextInputBuilder()
                        .setCustomId("payment")
                        .setLabel("Metoda")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(product),
                        new ActionRowBuilder().addComponents(price),
                        new ActionRowBuilder().addComponents(payment)
                    );

                    return interaction.showModal(modal);
                }

                if (type === "exchange") {

                    const modal = new ModalBuilder()
                        .setCustomId("lc_exchange")
                        .setTitle("StarX Exchange • Exchange");

                    const from = new TextInputBuilder()
                        .setCustomId("from")
                        .setLabel("Z czego")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const to = new TextInputBuilder()
                        .setCustomId("to")
                        .setLabel("Na co")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const amount = new TextInputBuilder()
                        .setCustomId("amount")
                        .setLabel("Kwota")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(from),
                        new ActionRowBuilder().addComponents(to),
                        new ActionRowBuilder().addComponents(amount)
                    );

                    return interaction.showModal(modal);
                }

                if (type === "contest") {

                    const finalText = `+rep ${interaction.user} konkurs`;

                    const embed = new EmbedBuilder()
                        .setColor("#1b2dff")
                        .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                        .setDescription(`${finalText}`);

                    await interaction.channel.send({ embeds: [embed] });

                    return interaction.reply({
                        content: `${EMOJI.money} Wysłano.`,
                        ephemeral: true
                    });
                }
            }

        } catch (err) {
            console.log("LC ERROR:", err);
        }
    });
};
