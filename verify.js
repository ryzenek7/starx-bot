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

    // przechowywanie odpowiedzi
    const challenges = new Map();

    // =========================
    // GENEROWANIE DZIAŁANIA
    // =========================
    function generateMath() {
        let a = Math.floor(Math.random() * 51); // 0-50
        let b = Math.floor(Math.random() * 51);

        const isAdd = Math.random() > 0.5;

        if (isAdd) {
            return {
                question: `${a} + ${b}`,
                answer: a + b
            };
        } else {
            // żeby nie było ujemnych
            if (b > a) [a, b] = [b, a];

            return {
                question: `${a} - ${b}`,
                answer: a - b
            };
        }
    }

    // =========================
    // PANEL
    // =========================
    async function sendPanel() {
        const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("🌟 Weryfikacja")
            .setDescription("Kliknij poniżej i rozwiąż proste działanie matematyczne.");

        const menu = new StringSelectMenuBuilder()
            .setCustomId("verify_select")
            .setPlaceholder("Wybierz opcję")
            .addOptions([
                {
                    label: "Zweryfikuj się",
                    value: "math"
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

        // SELECT MENU
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId !== "verify_select") return;

            const math = generateMath();

            challenges.set(interaction.user.id, math.answer);

            const modal = new ModalBuilder()
                .setCustomId("math_modal")
                .setTitle("Weryfikacja");

            const input = new TextInputBuilder()
                .setCustomId("math_answer")
                .setLabel(`Ile to: ${math.question}?`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }

        // MODAL SUBMIT
        if (interaction.isModalSubmit()) {
            if (interaction.customId !== "math_modal") return;

            const userAnswer = interaction.fields.getTextInputValue("math_answer");
            const correctAnswer = challenges.get(interaction.user.id);

            if (Number(userAnswer) === correctAnswer) {

                challenges.delete(interaction.user.id);

                const member = await interaction.guild.members.fetch(interaction.user.id);
                await member.roles.add(VERIFIED_ROLE_ID);

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
