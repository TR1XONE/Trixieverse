/**
 * TrixieVerse Language System
 * Swedish & English translations
 */

export type Language = 'sv' | 'en';

export const translations = {
  sv: {
    // Navigation
    nav: {
      dashboard: 'DASHBOARD',
      warRoom: 'KRIG RUMMET',
      library: 'BIBLIOTEK',
      coach: 'COACH',
    },

    // Dashboard
    dashboard: {
      title: 'VÄLKOMMEN TILL TRIXIEVERSE',
      subtitle: 'Din personliga AI-coach i TrixieVerse. En hyllning till TR1XON. Tillsammans klättrar vi till Legendary rank. Låt oss göra idag värt det!',
      motto: '"I TrixieVerse blir varje spelare en legend." - Inspirerad av TR1XON (EUW)',
      startWarRoom: 'STARTA KRIG RUMMET',
      viewMetaGuides: 'SE META-GUIDER',
      meetYourCoach: 'TRÄFFA DIN COACH',
      currentRank: 'NUVARANDE RANK',
      targetRank: 'MÅL RANK',
      mainRole: 'HUVUDROLL',
      choosePosition: 'Välj din position',
      championPool: 'CHAMPION-POOL',
      championsMastered: 'Champions behärskat',
      aboutTrixieVerse: '✨ OM TRIXIEVERSE',
      aboutText: 'TrixieVerse är en personaliserad AI-coachningsplattform inspirerad av den legendariska TR1XON från EUW. Här får varje spelare tillgång till en dedikerad coach som lär sig din spelstil, firar dina vinster och hjälper dig övervinna utmaningar.',
      aboutText2: 'Oavsett om du klättrar från Iron till Gold eller pushar för Challenger, är TrixieVerse din följeslagare på resan. Din coach kommer ihåg dina framsteg, anpassar sig till dina behov och blir den vän du vill spela med varje dag.',
      yourGoals: 'DINA MÅL',
      noGoals: 'Inga mål än. Låt oss sätta ditt första!',
      addGoal: '+ LÄGG TILL MÅL',
      createFirstGoal: 'SKAPA DITT FÖRSTA MÅL',
    },

    // War Room
    warRoom: {
      title: 'KRIG RUMMET',
      subtitle: 'Analysera din match och få coachning',
      yourRole: 'DIN ROLL',
      yourChampion: 'DIN CHAMPION',
      enemyTeam: 'FIENDENS LAG',
      getCoachAdvice: 'FÅ COACH-RÅD',
      baron: 'BARON',
      jungle: 'JUNGLE',
      mid: 'MID',
      adc: 'ADC',
      support: 'SUPPORT',
    },

    // Library
    library: {
      title: 'BIBLIOTEKET',
      subtitle: 'Meta-guider och tier-listor',
      metaUpdate: 'META-UPPDATERING',
      howToUse: 'HUR MAN ANVÄNDER DETTA BIBLIOTEK',
      tip1: '📌 Använd tier-listan för att välja starka champions denna säsong',
      tip2: '🎯 Fokusera på champions med högt win rate i din roll',
      tip3: '📈 Spela 3-5 champions för att behärska din roll',
      tip4: '🔄 Uppdateringar kommer varje vecka när meta förändras',
    },

    // Coach
    coach: {
      title: 'TRÄFFA DIN COACH',
      subtitle: 'Anpassa din personliga AI-coach',
      chooseYourCoach: 'VÄLJ DIN COACH',
      coachAccent: 'COACH-ACCENT',
      responseStyle: 'SVAR-STIL',
      messageLength: 'MEDDELANDE-LÄNGD',
      celebrationLevel: 'CELEBRATION-NIVÅ',
      quickTips: '💬 SNABBA TIPS',
      balancedAdvice: '💭 BALANSERAD RÅD',
      detailedAnalysis: '📖 DETALJERAD ANALYS',
      calmComposed: '😊 LUGN & BEHÄRSKAD',
      happySupport: '🎉 GLAD & STÖDJANDE',
      hypedFiredUp: '🚀 HYPAD & ELDAD',
      saveCoachPersonality: '💾 SPARA COACH-PERSONLIGHET',
      resetDefault: '🔄 ÅTERSTÄLL TILL STANDARD',
      coachMemory: 'COACH-MINNE',
      yourName: 'DITT NAMN',
      champions: 'CHAMPIONS',
      interactions: 'INTERAKTIONER',
      daysTogether: 'DAGAR TILLSAMMANS',
      coachPreview: 'COACH-FÖRHANDSVISNING',
      generatePreview: 'GENERERA FÖRHANDSVISNING',
      howItWorks: '💡 HUR DET FUNGERAR',
      tip1: '✨ Din coach lär sig din spelstil och anpassar sig över tid',
      tip2: '🧠 Minnessystemet kommer ihåg dina styrkor och svagheter',
      tip3: '🎯 Svar är personaliserade baserat på dina preferenser',
      tip4: '📈 Din coach firar dina framsteg genuint',
      tip5: '🤝 Ju mer du interagerar, desto bättre förstår din coach dig',
    },

    // Coach Personalities
    personalities: {
      sage: {
        name: 'SAGE',
        description: 'Lugn, analytisk, stödjande',
        traits: ['Tankfull', 'Tålmodig', 'Insiktsfull'],
      },
      blaze: {
        name: 'BLAZE',
        description: 'Energisk, konkurrenskraftig, motiverande',
        traits: ['Entusiastisk', 'Konkurrenskraftig', 'Motiverande'],
      },
      echo: {
        name: 'ECHO',
        description: 'Mystisk, observant, insiktsfull',
        traits: ['Observant', 'Djup', 'Mystisk'],
      },
      nova: {
        name: 'NOVA',
        description: 'Vänlig, humoristisk, relaterbar',
        traits: ['Rolig', 'Relaterbar', 'Vänlig'],
      },
    },

    // Accents
    accents: {
      neutral: 'Neutral',
      swedish: 'Svensk',
      british: 'Brittisk',
      casual: 'Casual',
    },

    // Styles
    styles: {
      supportive: 'Stödjande',
      competitive: 'Konkurrenskraftig',
      analytical: 'Analytisk',
      funny: 'Rolig',
    },

    // Achievements
    achievements: {
      title: 'ACHIEVEMENTS',
      firstWin: 'Första Vinsten',
      firstWinDesc: 'Vinn din första match',
      rankUp: 'Rank Up',
      rankUpDesc: 'Klättra till nästa rank',
      winStreak: 'Vinstrad',
      winStreakDesc: 'Vinn 3 matcher i rad',
      championMastery: 'Champion Mastery',
      championMasteryDesc: 'Behärska 5 champions',
      legendaryRank: 'Legendarisk Rank',
      legendaryRankDesc: 'Nå Legendary rank',
    },

    // Social
    social: {
      share: 'DELA',
      shareTikTok: 'DELA PÅ TIKTOK',
      shareInstagram: 'DELA PÅ INSTAGRAM',
      shareTwitter: 'DELA PÅ TWITTER',
      copyLink: 'KOPIERA LÄNK',
      copied: 'Kopierad!',
      beatMyScore: 'SLÅ MIN POÄNG',
      challenge: 'UTMANING',
      leaderboard: 'TOPPLISTA',
    },

    // Common
    common: {
      loading: 'Laddar...',
      error: 'Något gick fel',
      success: 'Framgång!',
      cancel: 'Avbryt',
      save: 'Spara',
      delete: 'Radera',
      edit: 'Redigera',
      close: 'Stäng',
      back: 'Tillbaka',
      next: 'Nästa',
      previous: 'Föregående',
    },
  },

  en: {
    // Navigation
    nav: {
      dashboard: 'DASHBOARD',
      warRoom: 'WAR ROOM',
      library: 'LIBRARY',
      coach: 'COACH',
    },

    // Dashboard
    dashboard: {
      title: 'WELCOME TO TRIXIEVERSE',
      subtitle: 'Your personal AI coach in TrixieVerse. A tribute to TR1XON. Together, we\'ll climb to Legendary rank. Let\'s make today count!',
      motto: '"In TrixieVerse, every player becomes a legend." - Inspired by TR1XON (EUW)',
      startWarRoom: 'START WAR ROOM',
      viewMetaGuides: 'VIEW META GUIDES',
      meetYourCoach: 'MEET YOUR COACH',
      currentRank: 'CURRENT RANK',
      targetRank: 'TARGET RANK',
      mainRole: 'MAIN ROLE',
      choosePosition: 'Choose your position',
      championPool: 'CHAMPION POOL',
      championsMastered: 'Champions mastered',
      aboutTrixieVerse: '✨ ABOUT TRIXIEVERSE',
      aboutText: 'TrixieVerse is a personalized AI coaching platform inspired by the legendary TR1XON from EUW. Here, every player has access to a dedicated coach that learns your playstyle, celebrates your wins, and helps you overcome challenges.',
      aboutText2: 'Whether you\'re climbing from Iron to Gold or pushing for Challenger, TrixieVerse is your companion on the journey. Your coach remembers your progress, adapts to your needs, and becomes the friend you want to play with every day.',
      yourGoals: 'YOUR GOALS',
      noGoals: 'No goals yet. Let\'s set your first one!',
      addGoal: '+ ADD GOAL',
      createFirstGoal: 'CREATE YOUR FIRST GOAL',
    },

    // War Room
    warRoom: {
      title: 'THE WAR ROOM',
      subtitle: 'Analyze your match and get coaching',
      yourRole: 'YOUR ROLE',
      yourChampion: 'YOUR CHAMPION',
      enemyTeam: 'ENEMY TEAM',
      getCoachAdvice: 'GET COACH ADVICE',
      baron: 'BARON',
      jungle: 'JUNGLE',
      mid: 'MID',
      adc: 'ADC',
      support: 'SUPPORT',
    },

    // Library
    library: {
      title: 'THE LIBRARY',
      subtitle: 'Meta guides and tier lists',
      metaUpdate: 'META UPDATE',
      howToUse: 'HOW TO USE THIS LIBRARY',
      tip1: '📌 Use the tier list to pick strong champions this season',
      tip2: '🎯 Focus on champions with high win rate in your role',
      tip3: '📈 Play 3-5 champions to master your role',
      tip4: '🔄 Updates come every week as the meta shifts',
    },

    // Coach
    coach: {
      title: 'MEET YOUR COACH',
      subtitle: 'Customize your personal AI coach',
      chooseYourCoach: 'CHOOSE YOUR COACH',
      coachAccent: 'COACH ACCENT',
      responseStyle: 'RESPONSE STYLE',
      messageLength: 'MESSAGE LENGTH',
      celebrationLevel: 'CELEBRATION LEVEL',
      quickTips: '💬 QUICK TIPS',
      balancedAdvice: '💭 BALANCED ADVICE',
      detailedAnalysis: '📖 DETAILED ANALYSIS',
      calmComposed: '😊 CALM & COMPOSED',
      happySupport: '🎉 HAPPY & SUPPORTIVE',
      hypedFiredUp: '🚀 HYPED & FIRED UP',
      saveCoachPersonality: '💾 SAVE COACH PERSONALITY',
      resetDefault: '🔄 RESET TO DEFAULT',
      coachMemory: 'COACH MEMORY',
      yourName: 'YOUR NAME',
      champions: 'CHAMPIONS',
      interactions: 'INTERACTIONS',
      daysTogether: 'DAYS TOGETHER',
      coachPreview: 'COACH PREVIEW',
      generatePreview: 'GENERATE PREVIEW',
      howItWorks: '💡 HOW IT WORKS',
      tip1: '✨ Your coach learns your playstyle and adapts over time',
      tip2: '🧠 The memory system remembers your strengths and weaknesses',
      tip3: '🎯 Responses are personalized based on your preferences',
      tip4: '📈 Your coach celebrates your progress genuinely',
      tip5: '🤝 The more you interact, the better your coach understands you',
    },

    // Coach Personalities
    personalities: {
      sage: {
        name: 'SAGE',
        description: 'Calm, analytical, supportive',
        traits: ['Thoughtful', 'Patient', 'Insightful'],
      },
      blaze: {
        name: 'BLAZE',
        description: 'Energetic, competitive, motivating',
        traits: ['Enthusiastic', 'Competitive', 'Motivating'],
      },
      echo: {
        name: 'ECHO',
        description: 'Mysterious, observant, insightful',
        traits: ['Observant', 'Deep', 'Mysterious'],
      },
      nova: {
        name: 'NOVA',
        description: 'Friendly, humorous, relatable',
        traits: ['Funny', 'Relatable', 'Friendly'],
      },
    },

    // Accents
    accents: {
      neutral: 'Neutral',
      swedish: 'Swedish',
      british: 'British',
      casual: 'Casual',
    },

    // Styles
    styles: {
      supportive: 'Supportive',
      competitive: 'Competitive',
      analytical: 'Analytical',
      funny: 'Funny',
    },

    // Achievements
    achievements: {
      title: 'ACHIEVEMENTS',
      firstWin: 'First Win',
      firstWinDesc: 'Win your first match',
      rankUp: 'Rank Up',
      rankUpDesc: 'Climb to the next rank',
      winStreak: 'Win Streak',
      winStreakDesc: 'Win 3 matches in a row',
      championMastery: 'Champion Mastery',
      championMasteryDesc: 'Master 5 champions',
      legendaryRank: 'Legendary Rank',
      legendaryRankDesc: 'Reach Legendary rank',
    },

    // Social
    social: {
      share: 'SHARE',
      shareTikTok: 'SHARE ON TIKTOK',
      shareInstagram: 'SHARE ON INSTAGRAM',
      shareTwitter: 'SHARE ON TWITTER',
      copyLink: 'COPY LINK',
      copied: 'Copied!',
      beatMyScore: 'BEAT MY SCORE',
      challenge: 'CHALLENGE',
      leaderboard: 'LEADERBOARD',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      success: 'Success!',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
    },
  },
};

export default translations;
