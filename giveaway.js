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

    // =========================
    // EMOJI (ID ONLY)
    // =========================
    const EMOJI = {
        gift: "<:gift:1502025560606507048>",
        pin: "<:pin:1501697389050986546>",
        time: "<:time:1502030015943151868>",
        users: "<:users:1500243884734206032>",
        green: "<a:green:1501990166082879538>",
        red: "<a:red:1501989543182864535>"
    };

    // =========================
    // STORAGE (GLOBAL = REROLL FIX)
    // =========================
    const giveaways = new Map();
    global.giveaways = giveaways;

    // =========================
    // READY + COMMANDS
    // =========================
    client.once(Events.ClientReady, async () => {

        const commands = [
            new SlashCommandBuilder()
                .setName("konkurs")
                .setDescription("Tworzy giveaway")
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
                .setDescription("Losuje nowego zwycięzcę")
                .addStringOption(o =>
                    o.setName("giveaway_id")
                        .setDescription("ID giveaway")
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ].map(c => c.toJSON());

        await client.application.commands.set(commands);

        console.log("✅ Giveaway system ready");
    });

    // =========================
    // INTERACTIONS
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =========================
            // CREATE GIVEAWAY
            // =========================
            if (interaction.isChatInputCommand() && interaction.commandName === "konkurs") {

                const nagroda = interaction.options.getString("nagroda");
                const czas = interaction.options.getString("czas");
                const wymagania = interaction.options.getString("wymagania");

                let ms = 0;
                const value = parseInt(czas);

                if (czas.endsWith("m")) ms = value * 60 * 1000;
                if (czas.endsWith("h")) ms = value * 60 * 60 * 1000;
                if (czas.endsWith("d")) ms = value * 24 * 60 * 60 * 1000;

                if (!ms || isNaN(ms)) {
                    return interaction.reply({
                        content: `${EMOJI.red} Zły format czasu`,
                        ephemeral: true
                    });
                }

                const giveawayId = Date.now().toString();

                const data = {
                    users: new Set(),
                    reward: nagroda,
                    requirements: wymagania,
                    end: Date.now() + ms,
                    messageId: null
                };

                giveaways.set(giveawayId, data);

                const end = Math.floor(data.end / 1000);

                const embed = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle(`${EMOJI.gift} GIVEAWAY`)
                    .setDescription([
                        `## ${EMOJI.pin} Nagroda`,
                        `\`${nagroda}\``,
                        ``,
                        `## ${EMOJI.pin} Wymagania`,
                        `> ${wymagania}`,
                        ``,
                        `## ${EMOJI.time} Koniec`,
                        `<t:${end}:R>`,
                        ``,
                        `## ${EMOJI.users} Uczestnicy: **0**`
                    ].join("\n"))
                    .setImage("https://i.imgur.com/4KfOswz.png") // 🔥 lepsza jakość
                    .setFooter({ text: `Giveaway ID: ${giveawayId}` })
                    .setTimestamp();

                const button = new ButtonBuilder()
                    .setCustomId(`join_${giveawayId}`)
                    .setLabel("Dołącz")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(EMOJI.gift);

                const row = new ActionRowBuilder().addComponents(button);

                const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);

                const msg = await channel.send({
                    embeds: [embed],
                    components: [row]
                });

                data.messageId = msg.id;

                await interaction.reply({
                    content: `${EMOJI.green} Giveaway utworzone!\nID: **${giveawayId}**`,
                    ephemeral: true
                });

                // =========================
                // AUTO END
                // =========================
                setTimeout(async () => {

                    const g = giveaways.get(giveawayId);
                    if (!g) return;

                    const users = [...g.users];

                    if (users.length === 0) {
                        return channel.send(`${EMOJI.red} Brak uczestników.`);
                    }

                    const winner = users[Math.floor(Math.random() * users.length)];

                    channel.send(`${EMOJI.gift} 🎉 Winner: <@${winner}>`);

                    giveaways.delete(giveawayId);

                }, ms);
            }

            // =========================
            // JOIN BUTTON + LIVE COUNTER
            // =========================
            if (interaction.isButton() && interaction.customId.startsWith("join_")) {

                const id = interaction.customId.split("join_")[1];
                const g = giveaways.get(id);

                if (!g) {
                    return interaction.reply({
                        content: `${EMOJI.red} Giveaway zakończony`,
                        ephemeral: true
                    });
                }

                if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
                    return interaction.reply({
                        content: `${EMOJI.red} Brak roli`,
                        ephemeral: true
                    });
                }

                if (g.users.has(interaction.user.id)) {
                    return interaction.reply({
                        content: `${EMOJI.red} Już bierzesz udział`,
                        ephemeral: true
                    });
                }

                g.users.add(interaction.user.id);

                const channel = interaction.channel;
                const msg = await channel.messages.fetch(g.messageId).catch(() => null);

                if (msg) {
                    const embed = EmbedBuilder.from(msg.embeds[0]);

                    embed.setDescription(
                        embed.data.description.replace(
                            /Uczestnicy: \*\*\d+\*\*/,
                            `Uczestnicy: **${g.users.size}**`
                        )
                    );

                    await msg.edit({ embeds: [embed] });
                }

                return interaction.reply({
                    content: `${EMOJI.green} Dołączyłeś!`,
                    ephemeral: true
                });
            }

            // =========================
            // REROLL FIX
            // =========================
            if (interaction.isChatInputCommand() && interaction.commandName === "reroll") {

                const id = interaction.options.getString("giveaway_id");
                const g = giveaways.get(id);

                if (!g) {
                    return interaction.reply({
                        content: `${EMOJI.red} Nie znaleziono giveaway`,
                        ephemeral: true
                    });
                }

                const users = [...g.users];

                if (users.length === 0) {
                    return interaction.reply({
                        content: `${EMOJI.red} Brak uczestników`,
                        ephemeral: true
                    });
                }

                const winner = users[Math.floor(Math.random() * users.length)];

                const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);

                channel.send(`${EMOJI.gift} 🎉 Nowy winner: <@${winner}>`);

                return interaction.reply({
                    content: `${EMOJI.green} Reroll wykonany!\nWinner: <@${winner}>`,
                    ephemeral: true
                });
            }

        } catch (err) {
            console.log("Giveaway error:", err);

            if (!interaction.replied) {
                interaction.reply({
                    content: "❌ Błąd giveaway",
                    ephemeral: true
                });
            }
        }
    });
};
