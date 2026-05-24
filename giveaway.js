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

    const CHANNEL_ID = "1502022020487970948";
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

    let giveawayMessageId = null;
    let participants = new Set();
    let giveawayEnd = null;
    let giveawayReward = null;

    // =====================
    // SLASH COMMAND
    // =====================
    client.once(Events.ClientReady, async () => {

        const data = [
            new SlashCommandBuilder()
                .setName("konkurs")
                .setDescription("Stwórz giveaway")
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
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ];

        await client.application.commands.set(data);
        console.log("✅ Giveaway loaded");
    });

    // =====================
    // CREATE GIVEAWAY
    // =====================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName !== "konkurs") return;

        const nagroda = interaction.options.getString("nagroda");
        const czas = interaction.options.getString("czas");

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

        participants = new Set();
        giveawayReward = nagroda;
        giveawayEnd = Date.now() + timeMs;

        const endTimestamp = Math.floor(giveawayEnd / 1000);

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`${EMOJI.gift} GIVEAWAY`)
            .setDescription(`
🎁 **Nagroda:** ${nagroda}

⏰ **Koniec:** <t:${endTimestamp}:R>

👥 **Uczestnicy:** 0

📌 Kliknij przycisk aby dołączyć
            `)
            .setFooter({ text: "StarX Exchange Giveaway" });

        const button = new ButtonBuilder()
            .setCustomId("join_giveaway")
            .setLabel("Dołącz")
            .setStyle(ButtonStyle.Success)
            .setEmoji(EMOJI.gift);

        const row = new ActionRowBuilder().addComponents(button);

        const channel = await client.channels.fetch(CHANNEL_ID);

        const msg = await channel.send({
            embeds: [embed],
            components: [row]
        });

        giveawayMessageId = msg.id;

        interaction.reply({
            content: `${EMOJI.green} Giveaway utworzony!`,
            flags: 64
        });

        // =====================
        // END GIVEAWAY
        // =====================
        setTimeout(async () => {

            const users = [...participants];

            const message = await channel.messages.fetch(giveawayMessageId).catch(() => null);

            if (!message) return;

            const disabledRow = new ActionRowBuilder().addComponents(
                ButtonBuilder.from(button).setDisabled(true)
            );

            await message.edit({ components: [disabledRow] });

            if (users.length === 0) {
                return channel.send(`${EMOJI.red} Brak uczestników.`);
            }

            const winner = users[Math.floor(Math.random() * users.length)];

            channel.send(`${EMOJI.gift} Gratulacje <@${winner}> wygrałeś **${nagroda}**!`);

        }, timeMs);
    });

    // =====================
    // JOIN
    // =====================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isButton()) return;
        if (interaction.customId !== "join_giveaway") return;
        if (interaction.message.id !== giveawayMessageId) return;

        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({
                content: `${EMOJI.red} Nie masz roli.`,
                flags: 64
            });
        }

        if (participants.has(interaction.user.id)) {
            return interaction.reply({
                content: `${EMOJI.red} Już bierzesz udział.`,
                flags: 64
            });
        }

        participants.add(interaction.user.id);

        return interaction.reply({
            content: `${EMOJI.green} Dołączyłeś do giveaway!`,
            flags: 64
        });
    });
};
