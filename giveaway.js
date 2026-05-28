// giveaway.js PREMIUM STARX STYLE
// discord.js v14

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    PermissionFlagsBits,
    Events
} = require("discord.js");

const fs = require("fs");

module.exports = (client) => {

    // =========================================
    // CONFIG
    // =========================================

    const GIVEAWAY_CHANNEL_ID = "1502022020487970948";

    const DATA_FILE = "./giveaways.json";

    // =========================================
    // EMOJI
    // =========================================

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

        gift: "🎉",
        green: "✅",
        red: "❌"
    };

    // =========================================
    // DATABASE
    // =========================================

    let giveaways = {};

    function saveData() {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(giveaways, null, 2)
        );
    }

    function loadData() {

        if (!fs.existsSync(DATA_FILE)) {

            fs.writeFileSync(DATA_FILE, "{}");
        }

        giveaways = JSON.parse(
            fs.readFileSync(DATA_FILE)
        );
    }

    loadData();

    // =========================================
    // READY
    // =========================================

    client.once(Events.ClientReady, async () => {

        console.log("✅ Giveaway system loaded");

        const commands = [

            new SlashCommandBuilder()

                .setName("giveaway")

                .setDescription("Stwórz giveaway")

                .addStringOption(o =>
                    o.setName("nagroda")
                        .setDescription("Nagroda")
                        .setRequired(true)
                )

                .addStringOption(o =>
                    o.setName("czas")
                        .setDescription("Np 10m / 1h / 1d")
                        .setRequired(true)
                )

                .addIntegerOption(o =>
                    o.setName("winnerzy")
                        .setDescription("Ilość winnerów")
                        .setRequired(true)
                )

                .addRoleOption(o =>
                    o.setName("rola")
                        .setDescription("Wymagana rola")
                        .setRequired(false)
                )

                .addIntegerOption(o =>
                    o.setName("bonus")
                        .setDescription("Bonusowe losy")
                        .setRequired(false)
                )

                .setDefaultMemberPermissions(
                    PermissionFlagsBits.Administrator
                )

        ].map(c => c.toJSON());

        await client.application.commands.set(commands);

        startGiveawayChecker();
    });

    // =========================================
    // PARSE TIME
    // =========================================

    function parseTime(time) {

        const value = parseInt(time);

        if (time.endsWith("m"))
            return value * 60 * 1000;

        if (time.endsWith("h"))
            return value * 60 * 60 * 1000;

        if (time.endsWith("d"))
            return value * 24 * 60 * 60 * 1000;

        return null;
    }

    // =========================================
    // CHECKER
    // =========================================

    function startGiveawayChecker() {

        setInterval(async () => {

            for (const id in giveaways) {

                const g = giveaways[id];

                if (g.ended) continue;

                if (Date.now() >= g.endAt) {

                    await endGiveaway(id);
                }
            }

        }, 5000);
    }

    // =========================================
    // END GIVEAWAY
    // =========================================

    async function endGiveaway(id) {

        const g = giveaways[id];

        if (!g) return;

        g.ended = true;

        saveData();

        const channel =
            await client.channels.fetch(
                g.channelId
            ).catch(() => null);

        if (!channel) return;

        const msg =
            await channel.messages.fetch(
                g.messageId
            ).catch(() => null);

        if (!msg) return;

        let pool = [];

        for (const userId of g.entries) {

            pool.push(userId);

            for (let i = 0; i < g.bonus; i++) {

                pool.push(userId);
            }
        }

        // anti duplicate
        pool = [...new Set(pool)];

        if (!pool.length) {

            return channel.send({
                content:
                    `${EMOJI.red} Giveaway anulowany — brak uczestników`
            });
        }

        const winners = [];

        while (
            winners.length < g.winners &&
            pool.length > 0
        ) {

            const random =
                pool[Math.floor(
                    Math.random() * pool.length
                )];

            if (!winners.includes(random)) {

                winners.push(random);
            }

            pool.splice(pool.indexOf(random), 1);
        }

        const embed = new EmbedBuilder()

            .setColor("#0f1014")

            .setTitle(
                `${EMOJI.gift} PREMIUM GIVEAWAY`
            )

            .setDescription(
`${EMOJI.pin} **Nagroda**
> ${g.reward}

${EMOJI.admin} **Winnerzy**
> ${winners.map(x => `<@${x}>`).join(", ")}

${EMOJI.clock} **Zakończono**
> <t:${Math.floor(Date.now() / 1000)}:R>

${EMOJI.ticket} **ID**
> \`${id}\`
`
            )

            .setImage(
                "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
            )

            .setFooter({
                text: "StarX Giveaway System"
            });

        const rerollButton =
            new ButtonBuilder()

                .setCustomId(`reroll_${id}`)

                .setLabel("REROLL")

                .setEmoji("🔄")

                .setStyle(ButtonStyle.Secondary);

        const row =
            new ActionRowBuilder()
                .addComponents(rerollButton);

        await msg.edit({
            embeds: [embed],
            components: [row]
        });

        await channel.send({
            content:
                `${EMOJI.gift} Gratulacje ${winners.map(x => `<@${x}>`).join(", ")}`
        });
    }

    // =========================================
    // INTERACTIONS
    // =========================================

    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // COMMAND
        // =====================================

        if (
            interaction.isChatInputCommand() &&
            interaction.commandName === "giveaway"
        ) {

            const reward =
                interaction.options.getString("nagroda");

            const time =
                interaction.options.getString("czas");

            const winners =
                interaction.options.getInteger("winnerzy");

            const role =
                interaction.options.getRole("rola");

            const bonus =
                interaction.options.getInteger("bonus") || 0;

            const ms = parseTime(time);

            if (!ms) {

                return interaction.reply({

                    content:
                        `${EMOJI.red} Zły format czasu`,

                    ephemeral: true
                });
            }

            const id = Date.now().toString();

            const endAt =
                Date.now() + ms;

            const embed =
                new EmbedBuilder()

                    .setColor("#0f1014")

                    .setTitle(
                        `${EMOJI.nitro} PREMIUM GIVEAWAY`
                    )

                    .setDescription(
`${EMOJI.pin} **Nagroda**
> ${reward}

${EMOJI.admin} **Winnerzy**
> ${winners}

${EMOJI.clock} **Koniec**
> <t:${Math.floor(endAt / 1000)}:R>

${EMOJI.lock} **Wymagana rola**
> ${role ? `<@&${role.id}>` : "Brak"}

${EMOJI.zap} **Bonusowe losy**
> +${bonus}

${EMOJI.ticket} **Uczestnicy**
> 0

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.arrow} Kliknij przycisk poniżej aby dołączyć.
`
                    )

                    .setImage(
                        "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
                    )

                    .setFooter({
                        text: `Giveaway ID: ${id}`
                    })

                    .setTimestamp();

            const button =
                new ButtonBuilder()

                    .setCustomId(`join_${id}`)

                    .setLabel("DOŁĄCZ")

                    .setEmoji("🎉")

                    .setStyle(ButtonStyle.Success);

            const row =
                new ActionRowBuilder()
                    .addComponents(button);

            const channel =
                await client.channels.fetch(
                    GIVEAWAY_CHANNEL_ID
                );

            const msg =
                await channel.send({

                    embeds: [embed],
                    components: [row]
                });

            giveaways[id] = {

                reward,
                winners,
                roleId: role ? role.id : null,
                bonus,
                entries: [],
                messageId: msg.id,
                channelId: channel.id,
                endAt,
                ended: false
            };

            saveData();

            return interaction.reply({

                content:
                    `${EMOJI.green} Giveaway utworzony`,

                ephemeral: true
            });
        }

        // =====================================
        // JOIN BUTTON
        // =====================================

        if (
            interaction.isButton() &&
            interaction.customId.startsWith("join_")
        ) {

            const id =
                interaction.customId.split("_")[1];

            const g = giveaways[id];

            if (!g) return;

            if (g.ended) {

                return interaction.reply({

                    content:
                        `${EMOJI.red} Giveaway zakończony`,

                    ephemeral: true
                });
            }

            // role requirement
            if (
                g.roleId &&
                !interaction.member.roles.cache.has(
                    g.roleId
                )
            ) {

                return interaction.reply({

                    content:
                        `${EMOJI.red} Nie posiadasz wymaganej roli`,

                    ephemeral: true
                });
            }

            // anti duplicate
            if (
                g.entries.includes(
                    interaction.user.id
                )
            ) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Już bierzesz udział`,

                    ephemeral: true
                });
            }

            g.entries.push(
                interaction.user.id
            );

            saveData();

            return interaction.reply({

                content:
                    `${EMOJI.green} Dołączono do giveaway`,

                ephemeral: true
            });
        }

        // =====================================
        // REROLL BUTTON
        // =====================================

        if (
            interaction.isButton() &&
            interaction.customId.startsWith("reroll_")
        ) {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                return interaction.reply({

                    content:
                        `${EMOJI.red} Brak permisji`,

                    ephemeral: true
                });
            }

            const id =
                interaction.customId.split("_")[1];

            const g = giveaways[id];

            if (!g) return;

            if (!g.entries.length) {

                return interaction.reply({

                    content:
                        `${EMOJI.red} Brak uczestników`,

                        ephemeral: true
                });
            }

            const winner =
                g.entries[
                    Math.floor(
                        Math.random() *
                        g.entries.length
                    )
                ];

            await interaction.reply({

                content:
                    `🔄 Nowy winner: <@${winner}>`
            });
        }
    });
};
