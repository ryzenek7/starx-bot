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

    const participants = new Map(); // giveawayId -> Set(users)
    const messages = new Map();      // giveawayId -> messageId

    let lastButton = null;

    // =========================
    // SLASH COMMANDS
    // =========================
    client.once(Events.ClientReady, async () => {

        const data = [
            new SlashCommandBuilder()
                .setName("konkurs")
                .setDescription("Stwórz giveaway")
                .addStringOption(o =>
                    o.setName("nagroda").setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("czas").setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("wymagania").setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

            new SlashCommandBuilder()
                .setName("reroll")
                .setDescription("Wylosuj nowego zwycięzcę giveaway")
                .addStringOption(o =>
                    o.setName("message_id")
                        .setDescription("ID wiadomości giveaway")
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ];

        await client.application.commands.set(data);
        console.log("✅ Giveaway loaded");
    });

    // =========================
    // COMMANDS HANDLER
    // =========================
    client.on(Events.InteractionCreate, async interaction => {

        try {

            if (!interaction.isChatInputCommand()) return;

            // =========================
            // CREATE GIVEAWAY
            // =========================
            if (interaction.commandName === "konkurs") {

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
                        content: `${EMOJI.red} Nieprawidłowy czas`,
                        ephemeral: true
                    });
                }

                const giveawayId = Date.now().toString();
                const users = new Set();

                participants.set(giveawayId, users);

                const endTimestamp = Math.floor((Date.now() + timeMs) / 1000);

                const embed = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle(`${EMOJI.gift} StarX Exchange » GIVEAWAY`)
                    .setDescription([
                        `## ${EMOJI.pin} Nagroda`,
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
                    .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
                    .setFooter({ text: "StarX Exchange • Giveaway System" })
                    .setTimestamp();

                const button = new ButtonBuilder()
                    .setCustomId(`join_giveaway_${giveawayId}`)
                    .setLabel("Dołącz")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(EMOJI.gift);

                lastButton = button;

                const row = new ActionRowBuilder().addComponents(button);

                const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);

                const message = await channel.send({
                    embeds: [embed],
                    components: [row]
                });

                messages.set(giveawayId, message.id);

                interaction.reply({
                    content: `${EMOJI.green} Giveaway utworzony!`,
                    ephemeral: true
                });

                setTimeout(async () => {

                    const list = participants.get(giveawayId);

                    if (!list || list.size === 0) {
                        return channel.send(`${EMOJI.red} Brak uczestników giveaway.`);
                    }

                    const arr = [...list];
                    const winner = arr[Math.floor(Math.random() * arr.length)];

                    const msg = await channel.messages.fetch(message.id).catch(() => null);

                    if (msg && lastButton) {
                        const disabled = new ActionRowBuilder().addComponents(
                            ButtonBuilder.from(lastButton).setDisabled(true)
                        );

                        await msg.edit({ components: [disabled] });
                    }

                    channel.send(`${EMOJI.gift} Gratulacje <@${winner}> wygrał **${nagroda}**!`);

                    participants.delete(giveawayId);
                    messages.delete(giveawayId);

                }, timeMs);
            }

            // =========================
            // REROLL COMMAND
            // =========================
            if (interaction.commandName === "reroll") {

                const messageId = interaction.options.getString("message_id");

                let giveawayId = null;

                for (const [id, msgId] of messages.entries()) {
                    if (msgId === messageId) {
                        giveawayId = id;
                        break;
                    }
                }

                if (!giveawayId) {
                    return interaction.reply({
                        content: `${EMOJI.red} Nie znaleziono giveaway.`,
                        ephemeral: true
                    });
                }

                const users = participants.get(giveawayId);

                if (!users || users.size === 0) {
                    return interaction.reply({
                        content: `${EMOJI.red} Brak uczestników.`,
                        ephemeral: true
                    });
                }

                const arr = [...users];
                const winner = arr[Math.floor(Math.random() * arr.length)];

                const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);

                channel.send(`${EMOJI.gift} Nowy zwycięzca: <@${winner}> 🎉`);

                return interaction.reply({
                    content: `${EMOJI.green} Reroll wykonany!`,
                    ephemeral: true
                });
            }

        } catch (err) {
            console.log("Interaction error:", err);

            if (interaction.replied || interaction.deferred) return;

            return interaction.reply({
                content: `${EMOJI.red} Wystąpił błąd.`,
                ephemeral: true
            });
        }
    });

    // =========================
    // JOIN BUTTON
    // =========================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("join_giveaway_")) return;

        const giveawayId = interaction.customId.replace("join_giveaway_", "");
        const users = participants.get(giveawayId);

        if (!users) {
            return interaction.reply({
                content: `${EMOJI.red} Giveaway zakończony.`,
                ephemeral: true
            });
        }

        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({
                content: `${EMOJI.red} Nie masz roli.`,
                ephemeral: true
            });
        }

        if (users.has(interaction.user.id)) {
            return interaction.reply({
                content: `${EMOJI.red} Już bierzesz udział.`,
                ephemeral: true
            });
        }

        users.add(interaction.user.id);

        return interaction.reply({
            content: `${EMOJI.green} Dołączyłeś!`,
            ephemeral: true
        });
    });
};
