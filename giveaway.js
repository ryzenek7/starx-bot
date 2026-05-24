const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = (client) => {

    const GIVEAWAY_CHANNEL_ID = "1502022020487970948";
    const REQUIRED_ROLE_ID = "1499521304146083954";

    const EMOJI = {
        gift: "<:gift:1502025560606507048>",
        pin: "<:pin:1501697389050986546>",
        zap: "<:zap:1501697151737139350>",
        lock: "<:lock:1501697222901895258>",
        time: "<:time:1502030015943151868>",
        users: "<:users:1500243884733894716>",
        green: "<a:green:1501990166082879538>",
        red: "<a:red:1501989543182864535>"
    };

    const participants = new Map();

    // =========================
    // SLASH COMMAND
    // =========================
    client.once(Events.ClientReady, async () => {

        const data = [
            new SlashCommandBuilder()
                .setName("konkurs")
                .setDescription("Stwórz nowy konkurs")
                .addStringOption(o =>
                    o.setName("nagroda")
                        .setDescription("Nagroda")
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("czas")
                        .setDescription("np. 10m, 1h, 1d")
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("wymagania")
                        .setDescription("Wymagania")
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ];

        await client.application.commands.set(data);
        console.log("✅ Slash commands loaded");
    });

    // =========================
    // INTERACTIONS
    // =========================
    client.on(Events.InteractionCreate, async interaction => {

        // =========================
        // CREATE GIVEAWAY
        // =========================
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "konkurs") return;

            const nagroda = interaction.options.getString("nagroda");
            const czas = interaction.options.getString("czas");
            const wymagania = interaction.options.getString("wymagania");

            let timeMs = 0;
            const value = parseInt(czas);

            if (czas.endsWith("m")) timeMs = value * 60 * 1000;
            if (czas.endsWith("h")) timeMs = value * 60 * 60 * 1000;
            if (czas.endsWith("d")) timeMs = value * 24 * 60 * 60 * 1000;

            if (!timeMs || isNaN(timeMs)) {
                return interaction.reply({
                    content: `${EMOJI.red} Nieprawidłowy czas!`,
                    flags: 64
                });
            }

            const giveawayId = Date.now().toString();
            participants.set(giveawayId, new Set());

            const endTimestamp = Math.floor((Date.now() + timeMs) / 1000);

            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle(`${EMOJI.gift} StarX Exchange » GIVEAWAY`)
                .setDescription([
                    `## ${EMOJI.green} Nagroda`,
                    `\`\`\`${nagroda}\`\`\``,
                    ``,
                    `## ${EMOJI.pin} Wymagania`,
                    `> ${wymagania}`,
                    ``,
                    `## ${EMOJI.zap} Jak dołączyć?`,
                    `> Kliknij przycisk poniżej`,
                    ``,
                    `## ${EMOJI.lock} Informacje`,
                    `> ${EMOJI.time} Koniec: <t:${endTimestamp}:R>`,
                    `> ${EMOJI.users} Uczestnicy: **0**`
                ].join("\n"))
                .setFooter({ text: "StarX Exchange • Giveaway System" })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId(`join_giveaway_${giveawayId}`)
                .setLabel("Dołącz")
                .setStyle(ButtonStyle.Success)
                .setEmoji(EMOJI.gift);

            const row = new ActionRowBuilder().addComponents(button);

            const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);
            const message = await channel.send({ embeds: [embed], components: [row] });

            interaction.reply({
                content: `${EMOJI.green} Giveaway utworzony!`,
                flags: 64
            });

            // =========================
            // END TIMER
            // =========================
            setTimeout(async () => {

                const users = participants.get(giveawayId);

                if (!users || users.size === 0) {
                    return channel.send(`${EMOJI.red} Brak uczestników giveaway.`);
                }

                const arr = [...users];
                const winner = arr[Math.floor(Math.random() * arr.length)];

                const disabledButton = ButtonBuilder.from(button).setDisabled(true);
                const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

                await message.edit({ components: [disabledRow] });

                channel.send(`${EMOJI.gift} Gratulacje <@${winner}> wygrałeś **${nagroda}**!`);

                participants.delete(giveawayId);

            }, timeMs);
        }

        // =========================
        // JOIN BUTTON
        // =========================
        if (interaction.isButton()) {

            if (!interaction.customId.startsWith("join_giveaway_")) return;

            const giveawayId = interaction.customId.replace("join_giveaway_", "");
            const users = participants.get(giveawayId);

            if (!users) {
                return interaction.reply({
                    content: `${EMOJI.red} Ten giveaway już się zakończył.`,
                    flags: 64
                });
            }

            if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
                return interaction.reply({
                    content: `${EMOJI.red} Nie masz wymaganej roli.`,
                    flags: 64
                });
            }

            if (users.has(interaction.user.id)) {
                return interaction.reply({
                    content: `${EMOJI.red} Już bierzesz udział.`,
                    flags: 64
                });
            }

            users.add(interaction.user.id);

            const message = interaction.message;
            const oldEmbed = message.embeds[0];

            const updated = EmbedBuilder.from(oldEmbed).setDescription(
                oldEmbed.description.replace(
                    /\*\*\d+\*\*/,
                    `**${users.size}**`
                )
            );

            await message.edit({ embeds: [updated] });

            return interaction.reply({
                content: `${EMOJI.green} Dołączono!`,
                flags: 64
            });
        }
    });
};
