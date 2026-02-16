# 🎮 TrixieVerse - AI Coach Platform

En AI-driven personifierad coachningsplattform för Wild Rift-spelare. En hyllning till TR1XON från EUW. Klättra från Iron till Legendary rank med din personliga coach som blir din bästa vän.

## 🌟 Om TrixieVerse

**TrixieVerse** är en personifierad AI-coachningsplattform designad för att bli spelarens "extra vän" i deras ranked-resa. Inspirerad av TR1XON's legacy från EUW, skapar vi en plattform där:

- Din coach har en egen personlighet och minnesystem
- Varje seger och framsteg celebreras genuint
- Du bygger en relation med din coach, inte bara får tips
- Community och vänskap är i fokus

### 🎨 Design & Tema

Plattformen är utformad med ett **Wild Rift-inspirerat tema** som kännetecknas av:

- **Mörk Gaming-estetik**: Deep Navy (#0a0e27) bakgrund för en immersiv gaming-upplevelse
- **Neon-Accenter**: Cyan (#0ea5e9), Lila (#8b5cf6), och Turkos (#06b6d4) för att skapa en cyberpunk-känsla
- **Gaming-Typografi**: Monospace-fonter (Space Mono, IBM Plex Mono) med uppercase och letter-spacing
- **Glow-Effekter**: Neon-glödande kort och animerade element för att förstärka gaming-atmosfären
- **Scanlines-effekt**: Klassisk arcade-effekt på hero-sektioner
- **Skarpa Hörn**: Inga rundade hörn för en mer kantiga, gaming-inspirerad design

## 🎯 Funktionalitet

### Dashboard
- **Personlig Välkomstmeddelande**: Uppmuntrande hälsning från din AI-coach
- **Rank-Överblick**: Visa aktuell rank, målrank och progression
- **Statistik-Kort**: Visa huvudroll, champion pool och andra nyckeltal
- **Mål-Sektion**: Spåra personliga förbättringsobjektiv med progress-bars

### War Room (Match Analyzer)
- **Roll-Val**: Välj mellan Baron, Jungle, Mid, ADC, Support
- **Champion-Väljare**: Dropdown med 25+ Wild Rift-champions
- **Motståndare-Val**: Valfri multi-select för counter-pick-analys
- **AI-Coach-Råd**: Personaliserad coachning inklusive:
  - Strategisk vägledning baserad på matchup
  - Itemrekommendationer
  - Makro-mål specifika för rollen
  - Uppmuntrande meddelande

### Library (Meta Database)
- **Tier Lists efter Roll**: S+, S, A, B, C-tiers för varje position
- **Win Rate & Pick Rate**: Statistik från Master+ rank
- **Champion-Jämförelse**: Side-by-side matchup-analys
- **Meta-Information**: Patch-version och senaste uppdatering

## 🚀 Komma Igång

### Installation

```bash
# Installera dependencies
pnpm install

# Starta utvecklingsserver
pnpm dev

# Öppna i webbläsaren
# http://localhost:3000 (eller nästa tillgänglig port)
```

### Build för Produktion

```bash
# Bygg för produktion
pnpm build

# Starta produktionsserver
pnpm start
```

## Android-app (lokal OCR + Bubble)

Det finns en Android-app i `android-app/` som kan köra lokal OCR (ML Kit) och visa coachning i en flytande bubble-overlay under spel.

### Funktioner (Android)

- Lokal coaching via `AresIntelligenceModule` (SQLite-baserad profil/minne)
- Predictive Blueprint snapshots (sparas i `blueprint_history`)
- Minimal Blueprint-kort i `MainActivity` (Summary, Next Move, Win Δ)
- Screen capture + OCR via `ScreenCaptureService`

### Bygg en debug-APK (för telefon-test)

Det här repot saknar Gradle Wrapper-scripts, så bygg enklast via Android Studio:

1. Öppna projektmappen `android-app/` i Android Studio
2. Vänta på Gradle sync
3. Bygg APK:
   - Build -> Build Bundle(s) / APK(s) -> Build APK(s)

APK:en hamnar normalt här:

`android-app/app/build/outputs/apk/debug/app-debug.apk`

### Installera APK

Via ADB:

`adb install -r android-app/app/build/outputs/apk/debug/app-debug.apk`

Manuellt:

- Kopiera `app-debug.apk` till t.ex. `Downloads/` på telefonen och installera.

### Starta live-coaching (OCR)

I appen:

1. Logga in med Discord (för person-specifik minnesprofil)
2. Tryck "Start Capture Service"
3. Godkänn overlay-permission och MediaProjection (skärminspelning)
4. Öppna Wild Rift och verifiera att bubble-overlay uppdateras

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express.js
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: Wouter
- **State Management**: React Context API
- **Styling**: Tailwind CSS med OKLCH-färgsystem

## 📁 Projektstruktur

```
wild-rift-coach/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx          # Navigation med Wild Rift-tema
│   │   │   ├── DashboardWelcome.tsx    # Hero-sektion med gaming-design
│   │   │   ├── WarRoom.tsx             # Match analyzer
│   │   │   ├── Library.tsx             # Meta tier lists
│   │   │   ├── GoalsSection.tsx        # Mål-tracking
│   │   │   └── ui/                     # Radix UI-komponenter
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── WarRoomPage.tsx
│   │   │   └── LibraryPage.tsx
│   │   ├── contexts/
│   │   │   └── CoachContext.tsx        # Global state management
│   │   ├── index.css                   # Wild Rift-tema CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
├── server/
│   └── index.ts                        # Express backend
├── shared/
│   └── const.ts
└── package.json
```

## 🎨 Färgschema

| Namn | Hex | Användning |
|------|-----|-----------|
| Primary | #0ea5e9 | Huvudknappar, fokuserade element |
| Secondary | #06b6d4 | Sekundära element, statistik |
| Accent | #8b5cf6 | Accent-element, highlights |
| Background | #0a0e27 | Huvudbakgrund |
| Card | #1a1f3a | Kort-bakgrund |
| Foreground | #e2e8f0 | Textfärg |

## 🎮 Gaming-Komponenter

### Neon-Glow Effekt
Alla kort har en neon-glödande effekt som förstärks vid hover:
```css
box-shadow: 0 0 20px rgba(14, 165, 233, 0.3), 0 0 40px rgba(6, 182, 212, 0.2);
```

### Scanlines
Hero-sektioner har en klassisk arcade-scanlines-effekt för autentisk gaming-känsla.

### Gaming-Buttons
Knappar har:
- Uppercase text med letter-spacing
- Neon-glow-effekt
- Press-animation (translateY på click)
- Smooth transitions

## 📱 Responsiv Design

Appen är fullt responsiv och optimerad för:
- 📱 Mobil (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔄 State Management

Använder React Context API för att hantera:
- Användar-profil
- Match-analys
- Mål-tracking
- Coach-minne

## 🌐 Deployment

Appen kan deployas på:
- Manus Static Hosting (PWA-ready)
- Vercel
- Netlify
- Vilken statisk hosting som helst

## 📝 Licens

MIT

## 🤝 Bidrag

Bidrag är välkomna! Vänligen öppna en issue eller pull request.

---

****Gjord med ❤️ för Wild Rift-spelare och inspirerad av TR1XON

I TrixieVerse blir du inte bara bättre - du får en vän som bryr sig om din progress. 🚀

---

## 🙏 Tribute to TR1XON

TrixieVerse är en hyllning till TR1XON från EUW - en spelare som inspirerar genom sitt engagemang, sin passion för spelet och sin positiva attityd. 

> "In TrixieVerse, every player becomes a legend."

Tack TR1XON för inspirationen! 💜
