// regulamin.js
const { EmbedBuilder, Events } = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1499573020321124412";

  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału regulamin.");

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("<:regulamin:1501693215328440370> StarX Exchange • Regulamin")
        .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━  
**POSTANOWIENIA OGÓLNE**

1. Korzystanie z serwera oznacza pełną akceptację regulaminu.  
2. Każdy użytkownik działa na własną odpowiedzialność.  
3. Administracja nie jest stroną żadnej transakcji.  

━━━━━━━━━━━━━━━━━━━━━━━  
**TRANSAKCJE I WYMIANY**

4. Wszystkie transakcje są dobrowolne między użytkownikami.  
5. Administracja nie ponosi odpowiedzialności za straty.  
6. Zaleca się korzystanie z usług middlemana (MM).  
7. Użytkownik ma obowiązek sprawdzić dane przed wysyłką środków.  
8. Transakcje kryptowalutowe są nieodwracalne.  

━━━━━━━━━━━━━━━━━━━━━━━  
**OFERTY I OGŁOSZENIA**

9. Każda oferta musi być czytelna i zawierać szczegóły.  
10. Zakaz publikowania fałszywych ofert.  
11. Zakaz sprzedaży treści nielegalnych.  
12. Zakaz spamowania i powielania ogłoszeń.  

━━━━━━━━━━━━━━━━━━━━━━━  
**BEZPIECZEŃSTWO**

13. Zakaz wszelkich prób oszustwa (scam).  
14. Zakaz podszywania się pod użytkowników lub administrację.  
15. Zakaz obchodzenia systemów zabezpieczeń oraz MM.  
16. Podejrzane działania należy zgłaszać administracji.  

━━━━━━━━━━━━━━━━━━━━━━━  
**ZACHOWANIE NA SERWERZE**

17. Zakaz obrażania i toksycznego zachowania.  
18. Zakaz reklam bez zgody administracji.  
19. Zakaz publikowania treści NSFW.  

━━━━━━━━━━━━━━━━━━━━━━━  
**SPORY I DECYZJE**

20. W przypadku sporów wymagane są dowody (screeny, logi).  
21. Decyzja administracji jest ostateczna.  
22. Naruszenie zasad skutkuje karą (mute / kick / ban).  

━━━━━━━━━━━━━━━━━━━━━━━  
**POSTANOWIENIA KOŃCOWE**

23. Regulamin może ulec zmianie w dowolnym momencie.  
24. Nieznajomość regulaminu nie zwalnia z jego przestrzegania.  

━━━━━━━━━━━━━━━━━━━━━━━  
<:uwaga:1501693444030992395> **Zachowaj ostrożność — unikaj podejrzanych transakcji.**
        `)
        .setFooter({
          text: "© 2026 StarX Exchange"
        })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      console.log("✅ Regulamin wysłany");

    } catch (err) {
      console.log("❌ Błąd regulamin.js:", err);
    }
  }

  if (client.isReady()) {
    sendPanel();
  } else {
    client.once(Events.ClientReady, sendPanel);
  }
};
