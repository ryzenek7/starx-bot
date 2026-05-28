const {
    Events,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { QuickDB } = require("quick.db");
const ms = require("ms");

const db = new QuickDB();

module.exports = (client) => {

    // =====================================
    // EMOJIS
    // =====================================

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

        cart: "<:SKLEP:1500243849535033577>"
    };

    // =====================================
    // REGISTER COMMAND
    // =====================================

    client.once(Events.ClientReady, async () => {

        const command = new SlashCommandBuilder()

            .setName("giveaway")
            .setDescription("🎉 Create giveaway")

            .addStringOption(option =>
                option
                    .setName("nagroda")
                    .setDescription("Nagroda")
                    .setRequired(true)
            )

            .addStringOption(option =>
                option
                    .setName("czas")
                    .setDescription("1m / 1h / 1d")
                    .setRequired(true)
            )

            .addIntegerOption(option =>
                option
                    .setName("winnerzy")
                    .setDescription("Ilość zwycięzców")
                    .setRequired(true)
            )

            .addRoleOption(option =>
                option
                    .setName("rola")
                    .setDescription("Wymagana rola")
            )

            .addIntegerOption(option =>
                option
                    .setName("bonus")
                    .setDescription("Bonusowe losy")
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            );

        try {

            await client.application.commands.create(
                command.toJSON()
            );

            console.log("✅ Giveaway loaded");

        } catch (err) {

            console.log(err);
        }
    });

    // =====================================
    // INTERACTION
    // =====================================

    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // COMMAND
        // =====================================

        if (
            interaction.isChatInputCommand() &&
            interaction.commandName === "giveaway"
        ) {

            const prize =
                interaction.options.getString("nagroda");

            const duration =
                interaction.options.getString("czas");

            const winnersCount =
                interaction.options.getInteger("winnerzy");

            const role =
                interaction.options.getRole("rola");

            const bonus =
                interaction.options.getInteger("bonus") || 0;

            const durationMs = ms(duration);

            if (!durationMs) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Niepoprawny czas`,

                    ephemeral: true
                });
            }

            const endAt =
                Date.now() + durationMs;

            const embed = new EmbedBuilder()

                .setColor("#0f0f0f")

                .setThumbnail(
                    interaction.guild.iconURL()
                )

                .setDescription(

                    `${EMOJI.nitro} **GIVEAWAY STARTED**\n\n` +

                    `${EMOJI.arrow} Nagroda:\n` +
                    `> **${prize}**\n\n` +

                    `${EMOJI.admin} Host:\n` +
                    `> ${interaction.user}\n\n` +

                    `${EMOJI.list} Winners:\n` +
                    `> **${winnersCount}**\n\n` +

                    `${EMOJI.clock} Koniec:\n` +
                    `> <t:${Math.floor(endAt / 1000)}:R>\n\n` +

                    (
                        role
                            ? `${EMOJI.support} Wymagana rola:\n> <@&${role.id}>\n\n`
                            : ""
                    ) +

                    (
                        bonus > 0
                            ? `${EMOJI.zap} Bonusowe losy:\n> +${bonus}\n\n`
                            : ""
                    ) +

                    `${EMOJI.ticket} Kliknij przycisk poniżej aby dołączyć`
                )

                .setFooter({
                    text: interaction.guild.name
                })

                .setTimestamp();

            const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId("giveaway_join")
                        .setLabel("Dołącz")
                        .setEmoji("🎉")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()

                        .setCustomId("giveaway_reroll")
                        .setLabel("Reroll")
                        .setEmoji("🔄")
                        .setStyle(ButtonStyle.Secondary)
                );

            const msg = await interaction.channel.send({

                embeds: [embed],
                components: [row]
            });

            await db.set(`giveaway_${msg.id}`, {

                messageId: msg.id,
                channelId: interaction.channel.id,

                prize,
                winners: winnersCount,

                endAt,

                hostId: interaction.user.id,

                roleId: role?.id || null,

                bonus,

                entries: [],

                ended: false
            });

            return interaction.reply({

                content:
                    `${EMOJI.zap} Giveaway został utworzony`,

                ephemeral: true
            });
        }

        // =====================================
        // BUTTONS
        // =====================================

        if (!interaction.isButton()) return;

        const giveaway =
            await db.get(
                `giveaway_${interaction.message.id}`
            );

        if (!giveaway) return;

        // =====================================
        // JOIN
        // =====================================

        if (interaction.customId === "giveaway_join") {

            if (giveaway.ended) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Giveaway zakończony`,

                    ephemeral: true
                });
            }

            if (
                giveaway.roleId &&
                !interaction.member.roles.cache.has(
                    giveaway.roleId
                )
            ) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Nie posiadasz wymaganej roli`,

                    ephemeral: true
                });
            }

            if (
                giveaway.entries.includes(
                    interaction.user.id
                )
            ) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Już bierzesz udział`,

                    ephemeral: true
                });
            }

            giveaway.entries.push(
                interaction.user.id
            );

            for (
                let i = 0;
                i < giveaway.bonus;
                i++
            ) {

                giveaway.entries.push(
                    interaction.user.id
                );
            }

            await db.set(
                `giveaway_${interaction.message.id}`,
                giveaway
            );

            return interaction.reply({

                content:
                    `${EMOJI.zap} Pomyślnie dołączono do giveaway`,

                ephemeral: true
            });
        }

        // =====================================
        // REROLL
        // =====================================

        if (interaction.customId === "giveaway_reroll") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Brak permisji`,

                    ephemeral: true
                });
            }

            if (!giveaway.ended) {

                return interaction.reply({

                    content:
                        `${EMOJI.warning} Giveaway jeszcze trwa`,

                    ephemeral: true
                });
            }

            const winners = pickWinners(
                giveaway.entries,
                giveaway.winners
            );

            await interaction.channel.send({

                content:

                    `${EMOJI.arrow} **GIVEAWAY REROLL**\n\n` +

                    `${EMOJI.ticket} Nowi zwycięzcy:\n` +

                    `${winners
                        .map(user => `> <@${user}>`)
                        .join("\n")}`
            });

            return interaction.reply({

                content:
                    `${EMOJI.zap} Wylosowano nowych zwycięzców`,

                ephemeral: true
            });
        }
    });

    // =====================================
    // AUTO END
    // =====================================

    client.once(Events.ClientReady, () => {

        setInterval(async () => {

            const all = await db.all();

            const giveaways = all.filter(data =>
                data.id.startsWith("giveaway_")
            );

            for (const data of giveaways) {

                const giveaway = data.value;

                if (giveaway.ended) continue;

                if (Date.now() < giveaway.endAt)
                    continue;

                giveaway.ended = true;

                await db.set(
                    `giveaway_${giveaway.messageId}`,
                    giveaway
                );

                const channel =
                    await client.channels.fetch(
                        giveaway.channelId
                    ).catch(() => null);

                if (!channel) continue;

                const msg =
                    await channel.messages.fetch(
                        giveaway.messageId
                    ).catch(() => null);

                if (!msg) continue;

                const winners = pickWinners(
                    giveaway.entries,
                    giveaway.winners
                );

                const embed = new EmbedBuilder()

                    .setColor("#ffd700")

                    .setDescription(

                        `${EMOJI.money} **GIVEAWAY ENDED**\n\n` +

                        `${EMOJI.arrow} Nagroda:\n` +
                        `> **${giveaway.prize}**\n\n` +

                        `${EMOJI.admin} Host:\n` +
                        `> <@${giveaway.hostId}>\n\n` +

                        `${EMOJI.ticket} Winners:\n` +

                        (
                            winners.length > 0

                                ? `> ${winners
                                    .map(user => `<@${user}>`)
                                    .join("\n> ")}`

                                : "> Brak zwycięzców"
                        )
                    )

                    .setTimestamp();

                await msg.edit({

                    embeds: [embed],
                    components: []
                });

                await channel.send({

                    content:

                        winners.length > 0

                            ? `${EMOJI.nitro} Gratulacje ${winners
                                .map(user => `<@${user}>`)
                                .join(", ")}`

                            : `${EMOJI.warning} Nikt nie dołączył do giveaway`
                });
            }

        }, 5000);
    });

    // =====================================
    // WINNER PICKER
    // =====================================

    function pickWinners(entries, count) {

        const copiedEntries = [...entries];

        const winners = [];

        while (
            winners.length < count &&
            copiedEntries.length > 0
        ) {

            const index = Math.floor(
                Math.random() * copiedEntries.length
            );

            const selected =
                copiedEntries[index];

            if (!winners.includes(selected)) {

                winners.push(selected);
            }

            copiedEntries.splice(index, 1);
        }

        return winners;
    }
};
