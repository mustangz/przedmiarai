# Strategia Outreach & Walidacja PMF — PrzedmiarAI

## Status quo
- Panel beta gotowy (PDF → AI → Excel)
- Ankieta post-beta na /ankieta (Supabase + Telegram)
- Lista 50 firm (LISTA_50_FIRM.md) + 21 kontaktów w contacts.json
- Resend czeka na weryfikację domeny
- Nikt jeszcze nie testował beta

---

## Faza 1: Warm-up (teraz, zanim Resend ruszy)

### 1.1 Rozgrzewka domeny email
- Resend zweryfikuje domenę → SPF, DKIM, DMARC automatycznie
- Pierwsze 3-5 dni: wysyłaj max 10-15 maili dziennie (nie 50 na raz)
- Zacznij od znanych kontaktów (znajomi z branży, LinkedIn connections)

### 1.2 LinkedIn prep (równolegle, zero kosztów)
- Profil Marcina: dodaj "Buduję PrzedmiarAI" w headline
- Wyślij connection requests do 10-15 kosztorysantów/PM-ów dziennie
- Szukaj: "kosztorysant", "kierownik budowy", "inspektor nadzoru" + Poland
- NIE sprzedawaj w invite — sam connect, rozmowa później

### 1.3 Zbierz dodatkowe kontakty (cel: 100+)
- **PIIB Wyszukiwarka** (wizytowka.piib.org.pl) — inżynierowie z uprawnieniami
- **Panorama Firm** — 37k firm budowlanych
- **Google Maps** — "biuro kosztorysowe [miasto]" dla top 10 miast
- **Przetargi BZP** — firmy startujące zostawiają dane kontaktowe
- Dodaj do contacts.json z kategoryzacją (kosztorysant > wykonawca > biuro projektowe)

---

## Faza 2: Pierwsza kampania walidacyjna (tydzień 1-2 po Resend)

### Cel: 5-10 rozmów walidacyjnych, NIE sprzedaż

### 2.1 Segment A: Biura kosztorysowe (23 firmy) — PRIORYTET
To jest core target. Robią przedmiary codziennie, ból jest największy.

**Email 1 (Dzień 0) — Mom Test: walidacja problemu**
```
Temat: pytanie o przedmiary w [firma]

Cześć [Imię],

Nazywam się Marcin, jestem inżynierem i pracuję nad narzędziem
dla kosztorysantów. Nie chcę nic sprzedawać — szukam ludzi z branży,
którzy mogą mi powiedzieć czy problem, który próbuję rozwiązać,
faktycznie istnieje.

Jedno pytanie: ile czasu zajmuje Wam typowy przedmiar od PDF-a
do gotowej tabeli w Excelu?

Dzięki z góry,
Marcin
przedmiarai.pl
```

**Email 2 (Dzień 3) — Wartość + konkret**
```
Temat: 1 obserwacja dot. przedmiarów

Cześć [Imię],

Pisałem kilka dni temu. Rozmawiałem z kilkoma kosztorysantami
i powtarza się jeden pattern — ręczne przepisywanie z PDF do Excela
to 60-70% czasu pracy.

Buduję narzędzie, które robi to automatycznie: wrzucasz PDF,
AI analizuje, dostajesz tabelę. Testuję to z 10 firmami za darmo.

Czy mogę wysłać Ci przykładowy wynik na podstawie Waszego
prawdziwego przedmiaru? Bez zobowiązań.

Marcin
```

**Email 3 (Dzień 7) — Łatwa odpowiedź**
```
Temat: re: pytanie o przedmiary

Cześć [Imię],

Rozumiem że jest masa roboty. Żeby było prościej — odpowiedz
jedną cyfrą:

1 — Robimy przedmiary ręcznie i to boli
2 — Mamy swoje narzędzia, nie szukamy nowych
3 — Nie robimy przedmiarów

Dzięki!
Marcin
```

**Email 4 (Dzień 14) — Break-up**
```
Temat: zamykam wątek

Cześć [Imię],

To moja ostatnia wiadomość — nie chcę spamować.
Gdyby kiedyś temat automatyzacji przedmiarów Cię zainteresował,
pisz śmiało: marcin@przedmiarai.pl

Powodzenia z projektami!
Marcin
```

### 2.2 Segment B: Średni wykonawcy (7 firm)
Ten sam schemat, ale zmień angle:
- Zamiast "ile czasu zajmuje przedmiar" → "ile płacicie za outsource kosztorysów?"
- Zamiast "narzędzie dla kosztorysantów" → "narzędzie dla działów ofertowania"

### 2.3 Segment C: Biura projektowe (10 firm)
- Angle: "Wasi klienci pytają o szacunkowe koszty? Automatyczny przedmiar jako value-add"
- Mniejszy priorytet — przedmiar to dla nich praca poboczna

### 2.4 Zasady wysyłki
- **Max 15 maili/dzień** przez pierwszy tydzień, potem 25-30
- **Odstęp 1.5s** między mailami (mamy w send-campaign.ts)
- **Rano 7:00-10:00** — najwyższy open rate w budownictwie
- **Wtorek-czwartek** — najlepsze dni
- **Każdy mail = 1 pytanie**, nie bombarduj
- **Stopka RODO**: "Nie chcesz więcej maili? Odpowiedz STOP"

---

## Faza 3: Beta testy (tydzień 3-4)

### 3.1 Kto dostaje beta?
Każdy kto odpowiedział na kampanię walidacyjną pozytywnie:
- Odpowiedział "1" (boli)
- Poprosił o demo/wynik
- Wyraził zainteresowanie

### 3.2 Onboarding beta testera
1. Wysyłasz magic link → wchodzi na /panel
2. Wgrywa swój prawdziwy PDF
3. AI analizuje → dostaje wynik + Excel
4. **24h po teście**: wysyłasz follow-up z linkiem do /ankieta (sendSurveyEmail)

### 3.3 Cel: 10-15 testerów, >5 wypełnionych ankiet

---

## Faza 4: Analiza wyników (tydzień 5-6)

### 4.1 Sygnały Go/No-Go z ankiety

| Metryka | Zielone światło | Żółte | Czerwone |
|---------|-----------------|-------|----------|
| Potencjał (Q10) avg | >7 | 5-7 | <5 |
| "Tak od razu" (Q14) | >30% | 15-30% | <15% |
| Gotów płacić >99 PLN | >40% | 20-40% | <20% |
| Response rate ankiety | >30% | 15-30% | <15% |
| Reply rate na cold email | >15% | 7-15% | <7% |

### 4.2 Co robić z wynikami

**Zielone → skaluj**
- Zwiększ outreach do 200-500 kontaktów
- Dodaj LinkedIn outreach jako drugi kanał
- Uruchom płatne plany (Start/Profesjonalny/Biuro)

**Żółte → iteruj**
- Przeczytaj pain points (Q7) i limitations (Q9) — co poprawić?
- Porozmawiaj 1:1 z 3-5 testerami (telefon/meet)
- Druga iteracja produktu → druga runda beta

**Czerwone → pivot**
- Problem nie boli wystarczająco LUB rozwiązanie nie trafia
- Wróć do rozmów walidacyjnych, szukaj innego segmentu
- Rozważ: instalacje (elektryka, hydraulika) zamiast ogólnych przedmiarów?

---

## Faza 5: Monetyzacja (tydzień 7+)

### 5.1 Pierwszy płacący klient = walidacja
Jedna osoba, która zapłaci prawdziwe pieniądze > 1000 ankiet "tak bym używał"

### 5.2 Pricing na start (z LP)
| Plan | Cena | Projekty |
|------|------|----------|
| Start (free) | 0 PLN | 3 analizy |
| Profesjonalny | 399 PLN | 5 projektów |
| Biuro Projektowe | 899 PLN | 15 projektów |

### 5.3 Taktyka "ręczna sprzedaż"
- Nie czekaj na self-serve — pierwszy 10 klientów sprzedaj osobiście
- Napisz do osób z ankiety, które dały score >7 i "tak od razu"
- Zaoferuj: "Zrobię Twój następny przedmiar za 99 PLN — jeśli wynik jest do bani, oddaję kasę"
- Money-back = zero risk dla klienta

---

## Kanały pozyskiwania (priorytet)

### Teraz (0 PLN)
1. **Cold email** — lista 50 firm + rozszerzenie do 100-200
2. **LinkedIn** — organic, connection + DM
3. **Stowarzyszenie Kosztorysantów** (kosztorysowanie.pl) — czy mają newsletter/forum?

### Za miesiąc (jeśli sygnały zielone)
4. **Grupy Facebook** — "Kosztorysowanie budowlane", "Budownictwo"
5. **Forum budowlane** — BuilderPolska, forum muratordom
6. **Przetargi** — monitoruj BZP, kontaktuj firmy które startują

### Za 3 miesiące (jeśli PMF potwierdzone)
7. **Google Ads** — "przedmiar z PDF", "automatyczny kosztorys"
8. **Content** — blog: "Jak przyspieszyć przedmiarowanie", SEO
9. **Partnerstwa** — integracja z Norma/Zuzia, co-marketing

---

## Podsumowanie timeline'u

```
Tydzień 0 (teraz):    LinkedIn prep + zbieranie kontaktów + czekamy na Resend
Tydzień 1-2:          Kampania walidacyjna → 50 cold emaili → cel: 5-10 rozmów
Tydzień 3-4:          Beta testy → 10-15 testerów → ankieta /ankieta
Tydzień 5-6:          Analiza wyników → decyzja Go/No-Go
Tydzień 7+:           Jeśli Go → monetyzacja, skalowanie outreachu
```

---

## Zasady (z knowledge base)

- **Mom Test**: pytaj o przeszłość, nie "czy byś używał"
- **Mailketing**: brak nagród za ankietę = lepsza jakość odpowiedzi
- **YC**: jeden płacący klient > tysiąc "fajny pomysł"
- **MAKE**: monetyzacja = walidacja, szukaj tysiąca podobnych do pierwszego płacącego
- **Sean Ellis**: 40%+ "bardzo rozczarowany" = PMF (ale dopiero po 2+ użyciach!)
