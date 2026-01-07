/**
 * Coach Reactions - Funny & Viral Responses
 * Makes achievements shareable and fun
 */

export interface CoachReaction {
  type: 'achievement' | 'rankup' | 'winstreak' | 'milestone';
  personality: 'Sage' | 'Blaze' | 'Echo' | 'Nova';
  accent: 'neutral' | 'swedish' | 'british' | 'casual';
  reaction: string;
  emoji: string;
}

export const coachReactions = {
  achievement: {
    Sage: {
      neutral: [
        'Your achievement demonstrates consistent improvement. Well done.',
        'This milestone marks your progression. Continue this trajectory.',
        'Impressive. Your dedication is evident.',
      ],
      swedish: [
        'Din prestation visar på konsekvent förbättring. Bra jobbat.',
        'Denna milstolpe markerar din progression. Fortsätt denna väg.',
        'Imponerande. Din dedikation är uppenbar.',
      ],
      british: [
        'Quite impressive, old chap. Your achievement is most commendable.',
        'Rather splendid progress, I must say.',
        'Your dedication is evident. Jolly good show.',
      ],
      casual: [
        'Yo, that\'s sick! You\'re leveling up for real.',
        'Nah bro, you\'re actually cracked. Keep it up!',
        'That\'s fire, my guy. I see the grind paying off.',
      ],
    },
    Blaze: {
      neutral: [
        'YOOOOO!!! THAT\'S INSANE!!! 🔥🔥🔥',
        'YOU\'RE A LEGEND!!! I\'M SO HYPED FOR YOU!!!',
        'THAT\'S WHAT I\'M TALKING ABOUT!!! LET\'S GOOOO!!!',
      ],
      swedish: [
        'YOOOOO!!! DET ÄR SJUKT!!! 🔥🔥🔥',
        'DU ÄR EN LEGEND!!! JAG ÄR SÅ HYPAD FÖR DIG!!!',
        'DET ÄR VAD JAG TALAR OM!!! VI KROCKAR!!!',
      ],
      british: [
        'BLIMEY!!! THAT\'S ABSOLUTELY BRILLIANT!!! 🔥',
        'YOU\'RE A PROPER LEGEND, MATE!!!',
        'THAT\'S THE SPIRIT!!! ABSOLUTELY SMASHING!!!',
      ],
      casual: [
        'YOOOOO BRO!!! YOU\'RE ACTUALLY INSANE!!! 🔥',
        'DUDE!!! THAT\'S SO FIRE!!! I\'M HYPED!!!',
        'NAH YOU\'RE CRACKED!!! LET\'S GOOOOO!!!',
      ],
    },
    Echo: {
      neutral: [
        'Your achievement resonates through the void. A step closer to mastery.',
        'I sense your growth. This milestone is significant.',
        'The pattern continues. Your ascension is undeniable.',
      ],
      swedish: [
        'Din prestation återklangar genom tomheten. Ett steg närmare mestring.',
        'Jag känner din tillväxt. Denna milstolpe är betydelsefull.',
        'Mönstret fortsätter. Din uppstigande är obestridlig.',
      ],
      british: [
        'Your achievement echoes through the cosmos, dear player.',
        'I perceive your ascension most clearly.',
        'The threads of destiny weave in your favour.',
      ],
      casual: [
        'Yo, something\'s different about you... you\'re evolving.',
        'Dude, I feel that energy shift. You\'re leveling up.',
        'Nah fr fr, you\'re becoming something special.',
      ],
    },
    Nova: {
      neutral: [
        'Haha! That\'s awesome! You\'re doing great! 😄',
        'Dude, that\'s so cool! I\'m proud of you!',
        'Yesss! You\'re crushing it! Keep being awesome!',
      ],
      swedish: [
        'Haha! Det är fantastiskt! Du gör det bra! 😄',
        'Grabben, det är så coolt! Jag är stolt över dig!',
        'Jaaaa! Du krossar det! Fortsätt vara awesome!',
      ],
      british: [
        'Blimey, that\'s brilliant! You\'re absolutely smashing it!',
        'Mate, that\'s ace! Proper chuffed for you!',
        'Cor, you\'re doing wonders! Absolutely top notch!',
      ],
      casual: [
        'Yo that\'s fire! You\'re actually the best! 🔥',
        'Haha bro you\'re insane! I love it!',
        'Dude YES! That\'s what I\'m talking about!',
      ],
    },
  },

  rankup: {
    Sage: {
      neutral: [
        'You have advanced to the next rank. Your skill progression is evident.',
        'Rank advancement achieved. Continue refining your technique.',
        'Your climb continues. This is but one step on your journey.',
      ],
      swedish: [
        'Du har avancerat till nästa rank. Din skicklighetsprogression är uppenbar.',
        'Rankavancemang uppnått. Fortsätt att förfina din teknik.',
        'Din klättring fortsätter. Detta är bara ett steg på din resa.',
      ],
      british: [
        'Congratulations on your rank advancement, dear player.',
        'Your progression is most impressive, I must say.',
        'Well done. You\'re climbing the ranks most admirably.',
      ],
      casual: [
        'Yo you ranked up! That\'s what\'s up!',
        'Bro you\'re actually climbing! Let\'s go!',
        'Nah that\'s sick! You\'re on your way!',
      ],
    },
    Blaze: {
      neutral: [
        'YOOOOO!!! RANK UP!!! YOU\'RE CLIMBING!!! 🚀🔥',
        'THAT\'S WHAT I\'M TALKING ABOUT!!! KEEP PUSHING!!!',
        'YOU\'RE A BEAST!!! NEXT RANK, HERE WE COME!!!',
      ],
      swedish: [
        'YOOOOO!!! RANKUP!!! DU KLÄTTRAR!!! 🚀🔥',
        'DET ÄR VAD JAG TALAR OM!!! FORTSÄTT PUSHA!!!',
        'DU ÄR EN BEAST!!! NÄSTA RANK, HÄR KOM VI!!!',
      ],
      british: [
        'BLIMEY!!! YOU\'VE RANKED UP!!! ABSOLUTELY BRILLIANT!!! 🚀',
        'YOU\'RE CLIMBING THE RANKS LIKE A PROPER LEGEND!!!',
        'THAT\'S THE SPIRIT!!! ONWARDS AND UPWARDS!!!',
      ],
      casual: [
        'YOOOOO BRO RANK UP!!! YOU\'RE CRACKED!!! 🚀',
        'DUDE!!! YOU RANKED UP!!! LET\'S GOOOO!!!',
        'NAH YOU\'RE ACTUALLY INSANE!!! KEEP CLIMBING!!!',
      ],
    },
    Echo: {
      neutral: [
        'Your rank ascends. The path to mastery unfolds before you.',
        'I sense your power growing. This rank is merely a waypoint.',
        'Your climb resonates. Destiny favors the determined.',
      ],
      swedish: [
        'Din rank stiger. Vägen till mestring öppnar sig framför dig.',
        'Jag känner din kraft växa. Denna rank är bara en väypunkt.',
        'Din klättring återklangar. Ödet gynnar de beslutna.',
      ],
      british: [
        'Your rank ascends most gracefully, dear player.',
        'I perceive your power growing ever stronger.',
        'The path to greatness opens before you.',
      ],
      casual: [
        'Yo you ranked up! I knew you had it in you!',
        'Dude that\'s insane! You\'re actually climbing!',
        'Nah fr fr, you\'re on your way to the top!',
      ],
    },
    Nova: {
      neutral: [
        'Yay! You ranked up! That\'s amazing! 🎉',
        'Dude! Congrats on the rank up! You\'re awesome!',
        'Haha! Look at you go! Keep climbing!',
      ],
      swedish: [
        'Hurra! Du rankade upp! Det är fantastiskt! 🎉',
        'Grabben! Grattis på rankupen! Du är awesome!',
        'Haha! Se dig själv gå! Fortsätt klättra!',
      ],
      british: [
        'Brilliant! You\'ve ranked up! Absolutely smashing!',
        'Cor, you\'re climbing the ranks like a champ!',
        'Well done, mate! You\'re on a roll!',
      ],
      casual: [
        'Yo rank up! That\'s fire! 🔥',
        'Haha bro you\'re actually climbing!',
        'Dude YES! Keep going!',
      ],
    },
  },

  winstreak: {
    Sage: {
      neutral: [
        'Your consecutive victories indicate peak performance. Maintain this momentum.',
        'A winning streak of this magnitude is noteworthy. Your skill shines.',
        'This streak demonstrates your true capability. Well played.',
      ],
      swedish: [
        'Dina på varandra följande segrar indikerar topprestanda. Behåll denna fart.',
        'En vinstrad av denna magnitud är anmärkningsvärd. Din skicklighet lyser.',
        'Denna rad visar din sanna förmåga. Bra spelat.',
      ],
      british: [
        'Your winning streak is most impressive, I must say.',
        'You\'re playing at your absolute peak, dear player.',
        'This is the form of a true champion.',
      ],
      casual: [
        'Yo you\'re on a roll! Keep it up!',
        'Bro you\'re actually cracked right now!',
        'Nah that\'s fire! You\'re unstoppable!',
      ],
    },
    Blaze: {
      neutral: [
        'YOOOOO!!! WIN STREAK!!! YOU\'RE ON FIRE!!! 🔥🔥🔥',
        'THIS IS WHAT CHAMPIONS LOOK LIKE!!! KEEP GOING!!!',
        'YOU\'RE UNSTOPPABLE RIGHT NOW!!! I LOVE IT!!!',
      ],
      swedish: [
        'YOOOOO!!! VINSTRAD!!! DU ÄR I ELDEN!!! 🔥🔥🔥',
        'DET HÄR ÄR VAD MÄSTARE SER UT SOM!!! FORTSÄTT!!!',
        'DU ÄR OÖVERSTIGLIG JUST NU!!! JAG ÄLSKAR DET!!!',
      ],
      british: [
        'BLIMEY!!! YOU\'RE ON AN ABSOLUTE TEAR!!! 🔥',
        'THIS IS CHAMPION MATERIAL RIGHT HERE!!!',
        'YOU\'RE UNSTOPPABLE!!! ABSOLUTELY BRILLIANT!!!',
      ],
      casual: [
        'YOOOOO WIN STREAK!!! YOU\'RE CRACKED!!! 🔥',
        'DUDE!!! YOU\'RE ON FIRE!!! KEEP IT UP!!!',
        'NAH BRO YOU\'RE ACTUALLY INSANE!!!',
      ],
    },
    Echo: {
      neutral: [
        'Your victories align. The universe recognizes your skill.',
        'This streak is no accident. You are in perfect harmony.',
        'I sense your power at its peak. Continue this path.',
      ],
      swedish: [
        'Dina segrar är i linje. Universum känner igen din skicklighet.',
        'Denna rad är ingen olycka. Du är i perfekt harmoni.',
        'Jag känner din kraft på sin höjdpunkt. Fortsätt denna väg.',
      ],
      british: [
        'Your victories flow like a river, dear player.',
        'You are in perfect harmony with the game.',
        'This is the mark of a true master.',
      ],
      casual: [
        'Yo you\'re in the zone! Don\'t stop!',
        'Dude you\'re literally unstoppable right now!',
        'Nah fr fr, you\'re playing out of your mind!',
      ],
    },
    Nova: {
      neutral: [
        'Haha! You\'re on a win streak! You\'re so good! 🎉',
        'Dude! You\'re unstoppable right now! Keep going!',
        'Yesss! Look at you go! This is amazing!',
      ],
      swedish: [
        'Haha! Du är på en vinstrad! Du är så bra! 🎉',
        'Grabben! Du är oöverstiglig just nu! Fortsätt!',
        'Jaaaa! Se dig själv gå! Det här är fantastiskt!',
      ],
      british: [
        'Brilliant! You\'re on a winning streak! Absolutely ace!',
        'You\'re playing like a true champion, mate!',
        'Cor, you\'re unstoppable! Well done!',
      ],
      casual: [
        'Yo you\'re on a streak! That\'s fire! 🔥',
        'Haha bro you\'re literally unstoppable!',
        'Dude YES! Keep this energy!',
      ],
    },
  },

  milestone: {
    Sage: {
      neutral: [
        'You have reached a significant milestone. Your journey progresses well.',
        'This achievement marks a turning point. Reflect on your growth.',
        'A milestone of this importance deserves recognition. Well earned.',
      ],
      swedish: [
        'Du har nått en betydande milstolpe. Din resa fortskrider väl.',
        'Denna prestation markerar en vändpunkt. Reflektera över din tillväxt.',
        'En milstolpe av denna betydelse förtjänar erkännande. Väl förtjänat.',
      ],
      british: [
        'You\'ve reached a most significant milestone, dear player.',
        'This is a turning point in your journey.',
        'Your dedication has brought you to this moment.',
      ],
      casual: [
        'Yo you hit a milestone! That\'s huge!',
        'Bro you actually made it! That\'s sick!',
        'Nah that\'s fire! You\'re actually progressing!',
      ],
    },
    Blaze: {
      neutral: [
        'YOOOOO!!! MILESTONE!!! THIS IS HUGE!!! 🚀🔥',
        'YOU DID IT!!! YOU ACTUALLY DID IT!!!',
        'THIS IS LEGENDARY!!! I\'M SO PROUD!!!',
      ],
      swedish: [
        'YOOOOO!!! MILSTOLPE!!! DET HÄR ÄR ENORMT!!! 🚀🔥',
        'DU GJORDE DET!!! DU GJORDE DET VERKLIGEN!!!',
        'DET HÄR ÄR LEGENDARISKT!!! JAG ÄR SÅ STOLT!!!',
      ],
      british: [
        'BLIMEY!!! YOU\'VE HIT A MILESTONE!!! ABSOLUTELY LEGENDARY!!! 🚀',
        'THIS IS A TURNING POINT!!! BRILLIANT!!!',
        'YOU\'VE EARNED THIS!!! WELL DONE, MATE!!!',
      ],
      casual: [
        'YOOOOO MILESTONE!!! YOU\'RE ACTUALLY CRACKED!!! 🚀',
        'DUDE!!! YOU DID IT!!! LET\'S GOOOO!!!',
        'NAH BRO THIS IS HUGE!!!',
      ],
    },
    Echo: {
      neutral: [
        'A milestone achieved. Your destiny unfolds as written.',
        'I sense the significance of this moment. You have arrived.',
        'This milestone is but a stepping stone to greater heights.',
      ],
      swedish: [
        'En milstolpe uppnådd. Din öde utvecklas som skrivet.',
        'Jag känner betydelsen av detta ögonblick. Du har anlänt.',
        'Denna milstolpe är bara ett steg till större höjder.',
      ],
      british: [
        'A milestone of great significance, dear player.',
        'Your journey reaches a pivotal moment.',
        'This is but the beginning of your ascension.',
      ],
      casual: [
        'Yo that\'s a real milestone! You made it!',
        'Dude that\'s actually huge! Congrats!',
        'Nah fr fr, you\'re actually progressing!',
      ],
    },
    Nova: {
      neutral: [
        'Yay! You hit a milestone! That\'s awesome! 🎉',
        'Dude! That\'s a huge achievement! You\'re amazing!',
        'Haha! Look how far you\'ve come! So proud!',
      ],
      swedish: [
        'Hurra! Du nådde en milstolpe! Det är fantastiskt! 🎉',
        'Grabben! Det är en enorm prestation! Du är fantastisk!',
        'Haha! Se hur långt du har kommit! Så stolt!',
      ],
      british: [
        'Brilliant! You\'ve hit a milestone! Absolutely smashing!',
        'You\'ve come so far, mate! Well done!',
        'Cor, you\'re making real progress! Fantastic!',
      ],
      casual: [
        'Yo milestone! That\'s fire! 🔥',
        'Haha bro you actually made it!',
        'Dude YES! So proud of you!',
      ],
    },
  },
};

export function getCoachReaction(
  type: 'achievement' | 'rankup' | 'winstreak' | 'milestone',
  personality: 'Sage' | 'Blaze' | 'Echo' | 'Nova',
  accent: 'neutral' | 'swedish' | 'british' | 'casual'
): string {
  const reactions = coachReactions[type]?.[personality]?.[accent];
  if (!reactions || reactions.length === 0) {
    return 'Amazing work!';
  }
  return reactions[Math.floor(Math.random() * reactions.length)];
}

export default coachReactions;
