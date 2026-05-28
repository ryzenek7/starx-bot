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

            .setName("gcreate")
            .setDescription("Create giveaway")

            .addStringOption(option =>
                option
                    .setName("nagroda")
                    .setDescription("Prize")
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
                    .setDescription("Number of winners")
                    .setRequired(true)
            )

            .addRoleOption(option =>
                option
                    .setName("rola")
                    .setDescription("Required role")
            )

            .addIntegerOption(option =>
                option
                    .setName("bonus_entries")
                    .setDescription("Bonus entries")
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            );

        try {

            await client.application.commands.create(
                command.toJSON()
            );

            console.log("✅ Giveaway command loaded");

        } catch (err) {

            console.log(err);

        }
    });

    // =====================================
    // INTERACTIONS
    // =====================================

    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // CREATE GIVEAWAY
        // =====================================

        if (
            interaction.isChatInputCommand() &&
            interaction.commandName === "gcreate"
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
                interaction.options.getInteger("bonus_entries") || 0;

            const durationMs = ms(duration);

            if (!durationMs) {

                return interaction.reply({
                    content:
                        `${EMOJI.warning} Invalid time format`,
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

                    `${EMOJI.arrow} Prize:\n` +
                    `> **${prize}**\n\n` +

                    `${EMOJI.admin} Host:\n` +
                    `> ${interaction.user}\n\n` +

                    `${EMOJI.list} Winners:\n` +
                    `> **${winnersCount}**\n\n` +

                    `${EMOJI.clock} Ends:\n` +
                    `> <t:${Math.floor(endAt / 1000)}:R>\n\n` +

                    (
                        role
                            ? `${EMOJI.support} Required Role:\n> <@&${role.id}>\n\n`
                            : ""
                    ) +

                    (
                        bonus > 0
                            ? `${EMOJI.zap} Bonus Entries:\n> +${bonus}\n\n`
                            : ""
                    ) +

                    `${EMOJI.ticket} Click button below to join`
                )

                .setFooter({
                    text: interaction.guild.name
                })

                .setTimestamp();

            const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId("giveaway_join")
                        .setLabel("Join")
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
                    `${EMOJI.zap} Giveaway created`,
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
        // JOIN BUTTON
        // =====================================

        if (interaction.customId === "giveaway_join") {

            if (giveaway.ended) {

                return interaction.reply({
                    content:
                        `${EMOJI.warning} Giveaway ended`,
                    ephemeral: true
                });
            }

            // REQUIRED ROLE

            if (
                giveaway.roleId &&
                !interaction.member.roles.cache.has(
                    giveaway.roleId
                )
            ) {

                return interaction.reply({
                    content:
                        `${EMOJI.warning} Missing required role`,
                    ephemeral: true
                });
            }

            // DUPLICATE

            if (
                giveaway.entries.includes(
                    interaction.user.id
                )
            ) {

                return interaction.reply({
                    content:
                        `${EMOJI.warning} Already joined`,
                    ephemeral: true
                });
            }

            // NORMAL ENTRY

            giveaway.entries.push(
                interaction.user.id
            );

            // BONUS ENTRIES

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
                    `${EMOJI.zap} Successfully joined giveaway`,
                ephemeral: true
            });
        }

        // =====================================
        // REROLL BUTTON
        // =====================================

        if (interaction.customId === "giveaway_reroll") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                return interaction.reply({
                    content:
                        `${EMOJI.warning} No permission`,
                    ephemeral: true
                });
            }

            if (!giveaway.ended) {

                return interaction.reply({
                    content:
                        `${EMOJI.warning} Giveaway not ended`,
                    ephemeral: true
                });
            }

            const winners = pickWinners(
                giveaway.entries,
                giveaway.winners
            );

            interaction.channel.send({

                content:

                    `${EMOJI.arrow} **GIVEAWAY REROLL**\n\n` +

                    `${EMOJI.ticket} New winners:\n` +

                    `${winners
                        .map(user => `> <@${user}>`)
                        .join("\n")}`
            });

            return interaction.reply({
                content:
                    `${EMOJI.zap} Rerolled`,
                ephemeral: true
            });
        }
    });

    // =====================================
    // AUTO END GIVEAWAYS
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

                        `${EMOJI.arrow} Prize:\n` +
                        `> **${giveaway.prize}**\n\n` +

                        `${EMOJI.admin} Host:\n` +
                        `> <@${giveaway.hostId}>\n\n` +

                        `${EMOJI.ticket} Winners:\n` +

                        (
                            winners.length > 0
                                ? `> ${winners
                                    .map(user => `<@${user}>`)
                                    .join("\n> ")}`
                                : "> No winners"
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

                            ? `${EMOJI.nitro} Congratulations ${winners
                                .map(user => `<@${user}>`)
                                .join(", ")}`

                            : `${EMOJI.warning} Nobody joined the giveaway`
                });
            }

        }, 5000);
    });

    // =====================================
    // PICK WINNERS
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
