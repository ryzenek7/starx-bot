const {
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder
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

    async function finishLC(interaction, content) {

        const repChannel =
            interaction.guild.channels.cache.get(REP_CHANNEL_ID);

        if (!repChannel) {
            return interaction.reply({
                content: `${EMOJI.warning} Nie znaleziono kanału REP.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#1b2dff")
            .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
            .setDescription(
`${EMOJI.zap} Legit został przygotowany

━━━━━━━━━━━━━━━━━━━━

${EMOJI.zap} Treść:

\`\`\`
${content}
\`\`\`

━━━━━━━━━━━━━━━━━━━━

${EMOJI.lock} Wyślij na <#${REP_CHANNEL_ID}>`
            )
            .setFooter({
                text: "© 2026 StarX Exchange"
            })
            .setTimestamp();

        await repChannel.send({
            embeds: [embed]
        });

        const member = await interaction.guild.members.fetch(
            interaction.user.id
        );

        if (!member.roles.cache.has(CLIENT_ROLE_ID)) {
            await member.roles.add(CLIENT_ROLE_ID).catch(() => {});
        }

        await interaction.channel.permissionOverwrites.edit(
            interaction.user.id,
            {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            }
        );

        return interaction.reply({
            content:
`${EMOJI.money} Legit został wysłany.
${EMOJI.ticket} Otrzymałeś rangę Klient.
${EMOJI.lock} Dostęp do ticketa został odebrany.`,
            ephemeral: true
        });
    }

    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // /lc
            if (
                interaction.isChatInputCommand() &&
                interaction.commandName === "lc"
            ) {

                if (
                    !interaction.member.roles.cache.has(STAFF_ROLE_ID)
                ) {
                    return interaction.reply({
                        content: `${EMOJI.warning} Brak permisji.`,
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
                    content: `${EMOJI.money} Wybierz typ Legit Check`,
                    components: [
                        new ActionRowBuilder().addComponents(menu)
                    ],
                    ephemeral: true
                });
            }

            // SELECT MENU
            if (
                interaction.isStringSelectMenu() &&
                interaction.customId === "lc_type"
            ) {

                const type = interaction.values[0];

                const modal = new ModalBuilder();

                if (type === "purchased") {

                    modal
                        .setCustomId("lc_purchased")
                        .setTitle("Purchased LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("Produkt / Usługa")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                if (type === "exchange") {

                    modal
                        .setCustomId("lc_exchange")
                        .setTitle("Exchange LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("np. LTC -> BLIK 100 PLN")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }

                if (type === "contest") {

                    modal
                        .setCustomId("lc_contest")
                        .setTitle("Konkurs LC");

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("data")
                                .setLabel("Nazwa konkursu")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                    return interaction.showModal(modal);
                }
            }

            // PURCHASED
            if (
                interaction.isModalSubmit() &&
                interaction.customId === "lc_purchased"
            ) {

                const data =
                    interaction.fields.getTextInputValue("data");

                return finishLC(
                    interaction,
                    `+rep ${interaction.user.username} purchased ${data}`
                );
            }

            // EXCHANGE
            if (
                interaction.isModalSubmit() &&
                interaction.customId === "lc_exchange"
            ) {

                const data =
                    interaction.fields.getTextInputValue("data");

                return finishLC(
                    interaction,
                    `+rep ${interaction.user.username} exchange ${data}`
                );
            }

            // CONTEST
            if (
                interaction.isModalSubmit() &&
                interaction.customId === "lc_contest"
            ) {

                const data =
                    interaction.fields.getTextInputValue("data");

                return finishLC(
                    interaction,
                    `+rep ${interaction.user.username} konkurs ${data}`
                );
            }

        } catch (err) {
            console.error("LC ERROR:", err);
        }
    });
};
