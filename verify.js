const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

module.exports = (client) => {

    // =========================
    // CONFIG
    // =========================
    const VERIFY_CHANNEL_ID = "1499725942313058344";
    const VERIFIED_ROLE_ID = "1499521304146083954";

    // kanały do pinga po weryfikacji
    const PING_CHANNELS = [
        "1499512781861556314",
        "1499812157246669001",
        "1499902366843932763",
        "1499513009188376767",
        "1499568863602540645",
        "1499573020321124412",
        "1500261480212205629"
    ];

    // przechowywanie odpowiedzi
    const challenges = new Map();

    // =========================
    // GENEROWANIE DZIAŁANIA
    // max wynik = 30
    // =========================
    function generateMath() {

        const isAdd = Math.random() > 0.5;

        // DODAWANIE
        if (isAdd) {

            const a = Math.floor(Math.random() * 16); // 0-15
            const b = Math.floor(Math.random() * (31 - a)); // żeby max było 30

            return {
                question: `🟢 ${a} + ${b}`,
                answer: a + b
            };
        }

        // ODEJMOWANIE
        const a = Math.floor(Math.random() * 31); // 0-30
        const b = Math.floor(Math.random() * (a + 1)); // żeby nie było minusów

        return {
            question: `🔴 ${a} − ${b}`,
            answer: a - b
        };
    }

    // =========================
    // PANEL
    // =========================
    async function sendPanel() {

        const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🛡️ Weryfikacja")
            .setDescription(
                [
                    "### Witaj!",
                    "",
                    "Aby uzyskać dostęp do serwera:",
                    "• kliknij menu poniżej",
                    "• rozwiąż krótkie działanie matematyczne",
                    "",
                    "> Wyniki są maksymalnie do **30**"
                ].join("\n")
            )
            .setFooter({
                text: "System weryfikacji"
            });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("verify_select")
            .setPlaceholder("📌 Kliknij aby się zweryfikować")
            .addOptions([
                {
                    label: "Zweryfikuj się",
                    description: "Rozwiąż działanie matematyczne",
                    value: "math",
                    emoji: "✅"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await channel.send({
            embeds: [embed],
            components: [row]
        });
    }

    // =========================
    // READY
    // =========================
    client.once(Events.ClientReady, async () => {
        await sendPanel();
    });

    // =========================
    // INTERAKCJE
    // =========================
    client.on(Events.InteractionCreate, async (interaction) => {

        // =========================
        // SELECT MENU
        // =========================
        if (interaction.isStringSelectMenu()) {

            if (interaction.customId !== "verify_select") return;

            const math = generateMath();

            challenges.set(interaction.user.id, math.answer);

            const modal = new ModalBuilder()
                .setCustomId("math_modal")
                .setTitle("🧠 Weryfikacja");

            const input = new TextInputBuilder()
                .setCustomId("math_answer")
                .setLabel(`Ile to: ${math.question} ?`)
                .setPlaceholder("Wpisz poprawny wynik")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(input);

            modal.addComponents(row);

            await interaction.showModal(modal);
        }

        // =========================
        // MODAL SUBMIT
        // =========================
        if (interaction.isModalSubmit()) {

            if (interaction.customId !== "math_modal") return;

            const userAnswer = interaction.fields.getTextInputValue("math_answer");
            const correctAnswer = challenges.get(interaction.user.id);

            // POPRAWNA ODPOWIEDŹ
            if (Number(userAnswer) === correctAnswer) {

                challenges.delete(interaction.user.id);

                const member = await interaction.guild.members.fetch(interaction.user.id);

                await member.roles.add(VERIFIED_ROLE_ID);

                // ping na kanałach
                for (const channelId of PING_CHANNELS) {

                    try {

                        const channel = await client.channels.fetch(channelId);

                        const msg = await channel.send({
                            content: `${interaction.user}`
                        });

                        setTimeout(async () => {
                            await msg.delete().catch(() => {});
                        }, 1000);

                    } catch (err) {
                        console.log(`Błąd kanału ${channelId}:`, err);
                    }
                }

                await interaction.reply({
                    content: "✅ Zweryfikowano poprawnie!",
                    ephemeral: true
                });

            } else {

                await interaction.reply({
                    content: "❌ Błędna odpowiedź! Spróbuj ponownie.",
                    ephemeral: true
                });
            }
        }
    });
};
