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

    // =========================
    // SLASH COMMAND
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
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ];

        await client.application.commands.set(data);
        console.log("✅ Giveaway loaded");
    });

    // =========================
    // CREATE GIVEAWAY
    // =========================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;
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
                content: `${EMOJI.red} Nieprawidłowy czas`,
                flags: 64
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

        const row = new ActionRowBuilder().addComponents(button);

        const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);

        const message = await channel.send({
            embeds: [embed],
            components: [row]
        });

        messages.set(giveawayId, message.id);

        interaction.reply({
            content: `${EMOJI.green} Giveaway utworzony!`,
            flags: 64
        });

        // =========================
        // END
        // =========================
        setTimeout(async () => {

            const list = participants.get(giveawayId);

            if (!list || list.size === 0) {
                return channel.send(`${EMOJI.red} Brak uczestników giveaway.`);
            }

            const arr = [...list];
            const winner = arr[Math.floor(Math.random() * arr.length)];

            const msgId = messages.get(giveawayId);
            const msg = await channel.messages.fetch(msgId).catch(() => null);

            if (msg) {
                const disabled = new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(button).setDisabled(true)
                );

                await msg.edit({ components: [disabled] });
            }

            channel.send(`${EMOJI.gift} Gratulacje <@${winner}> wygrał **${nagroda}**!`);

            participants.delete(giveawayId);
            messages.delete(giveawayId);

        }, timeMs);
    });

    // =========================
    // JOIN BUTTON (FIXED LIVE COUNTER)
    // =========================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("join_giveaway_")) return;

        const giveawayId = interaction.customId.replace("join_giveaway_", "");
        const users = participants.get(giveawayId);

        if (!users) {
            return interaction.reply({
                content: `${EMOJI.red} Giveaway zakończony.`,
                flags: 64
            });
        }

        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({
                content: `${EMOJI.red} Nie masz roli.`,
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

        // =========================
        // LIVE UPDATE EMBED (FIX LICZNIKA)
        // =========================
        const channel = interaction.channel;
        const msgId = messages.get(giveawayId);

        const msg = await channel.messages.fetch(msgId).catch(() => null);
        if (msg) {

            const embed = EmbedBuilder.from(msg.embeds[0]);

            const newDesc = embed.data.description.replace(
                /Uczestnicy: \*\*\d+\*\*/,
                `Uczestnicy: **${users.size}**`
            );

            embed.setDescription(newDesc);

            await msg.edit({ embeds: [embed] });
        }

        return interaction.reply({
            content: `${EMOJI.green} Dołączyłeś!`,
            flags: 64
        });
    });
};
