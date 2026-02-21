// Maps Wild Rift rune names → image URLs + descriptions
// Community Dragon CDN (LOWERCASE paths!) for LoL PC shared runes; Fandom wiki CDN for WR-exclusive runes

const CD = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles';
const WIKI = 'https://static.wikia.nocookie.net/leagueoflegends/images';

interface RuneInfo {
    url: string;
    description: string;
}

export const runeData: Record<string, RuneInfo> = {
    // ── Keystones ─────────────────────────────────────────
    "Electrocute": {
        url: `${CD}/domination/electrocute/electrocute.png`,
        description: "Hitting a champion with 3 separate attacks or abilities within 3s deals bonus adaptive damage."
    },
    "Conqueror": {
        url: `${CD}/precision/conqueror/conqueror.png`,
        description: "Gain stacking AD or AP when hitting champions. At max stacks, deal bonus adaptive damage."
    },
    "Fleet Footwork": {
        url: `${CD}/precision/fleetfootwork/fleetfootwork.png`,
        description: "Moving and attacking builds energy stacks. At 100 stacks, next attack heals and grants movement speed."
    },
    "Lethal Tempo": {
        url: `${CD}/precision/lethaltempo/lethaltempotemp.png`,
        description: "Gain stacking attack speed when attacking champions. At max stacks, gain bonus attack speed."
    },
    "Grasp of the Undying": {
        url: `${CD}/resolve/graspoftheundying/graspoftheundying.png`,
        description: "In combat, periodically empower your next attack to deal bonus magic damage, heal you, and permanently increase your max HP."
    },
    "Aftershock": {
        url: `${CD}/resolve/veteranaftershock/veteranaftershock.png`,
        description: "After immobilizing a champion, gain bonus armor and MR, then explode dealing magic damage."
    },
    "Dark Harvest": {
        url: `${CD}/domination/darkharvest/darkharvest.png`,
        description: "Damaging low-health champions grants soul stacks, enhancing subsequent Dark Harvest damage."
    },
    "Phase Rush": {
        url: `${CD}/sorcery/phaserush/phaserush.png`,
        description: "Hitting a champion with 3 attacks or abilities within 3s grants a burst of movement speed."
    },
    "First Strike": {
        url: `${CD}/inspiration/firststrike/firststrike.png`,
        description: "Damaging an enemy champion first grants bonus gold and your attacks deal bonus true damage briefly."
    },
    "Glacial Augment": {
        url: `${CD}/inspiration/glacialaugment/glacialaugment.png`,
        description: "Immobilizing champions creates glacial rays that slow nearby enemies and reduce their damage."
    },
    "Aery": {
        url: `${CD}/sorcery/summonaery/summonaery.png`,
        description: "Attacks and abilities send Aery to a target, damaging enemies or shielding allies."
    },
    "Font of Life": {
        url: `${CD}/resolve/fontoflife/fontoflife.png`,
        description: "Impairing enemy champions marks them. Allies who attack marked enemies heal over time."
    },
    "Kraken Slayer": {
        url: `${WIKI}/f/f7/Kraken_Slayer_%28Wild_Rift%29_rune.png/revision/latest?cb=20230808112839`,
        description: "Every 3rd basic attack against the same target deals additional true damage."
    },

    // ── Domination minor ─────────────────────────────────
    "Brutal": {
        url: `${WIKI}/c/ca/Brutal_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102514`,
        description: "Gain bonus AD and armor penetration, or AP and magic penetration (adaptive)."
    },
    "Sudden Impact": {
        url: `${CD}/domination/suddenimpact/suddenimpact.png`,
        description: "After a dash, blink, or leaving stealth, gain bonus lethality and magic penetration."
    },
    "Gathering Storm": {
        url: `${CD}/sorcery/gatheringstorm/gatheringstorm.png`,
        description: "Periodically gain increasing bonus AD or AP as the game progresses."
    },
    "Scorch": {
        url: `${CD}/sorcery/scorch/scorch.png`,
        description: "Your next ability hit on a champion deals bonus magic damage. Refreshes every few seconds."
    },
    "Weakness": {
        url: `${WIKI}/3/30/Weakness_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713114049`,
        description: "Slowing or immobilizing a champion marks them, causing them to take increased damage."
    },
    "Cheap Shot": {
        url: `${CD}/domination/cheapshot/cheapshot.png`,
        description: "Deal bonus true damage to champions you slow or immobilize."
    },
    "Eyeball Collector": {
        url: `${CD}/domination/eyeballcollection/eyeballcollection.png`,
        description: "Gain adaptive stats for champion takedowns."
    },
    "Zombie Ward": {
        url: `${CD}/domination/zombieward/zombieward.png`,
        description: "Gain adaptive stats when you destroy enemy wards or your wards expire."
    },
    "Hunter - Vampirism": {
        url: `${WIKI}/c/ca/Brutal_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102514`,
        description: "Gain physical or magical vamp. Unique champion takedowns increase the effect."
    },
    "Champion": {
        url: `${WIKI}/c/ca/Brutal_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102514`,
        description: "Gain bonus damage against champions, but lose some HP for each champion eliminated."
    },
    "Giant Slayer": {
        url: `${WIKI}/c/ca/Brutal_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102514`,
        description: "Deal bonus damage to enemy champions with higher max HP than you."
    },
    "Empowered Attack": {
        url: `${WIKI}/c/ca/Brutal_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102514`,
        description: "Your basic attacks deal bonus damage after casting an ability."
    },

    // ── Resolve minor ────────────────────────────────────
    "Conditioning": {
        url: `${CD}/resolve/conditioning/conditioning.png`,
        description: "After a short delay, gain bonus armor and magic resistance."
    },
    "Second Wind": {
        url: `${CD}/resolve/secondwind/secondwind.png`,
        description: "After taking damage from a champion, regenerate missing health over time."
    },
    "Bone Plating": {
        url: `${CD}/resolve/boneplating/boneplating.png`,
        description: "After taking damage from a champion, the next 3 attacks or abilities from them deal reduced damage."
    },
    "Overgrowth": {
        url: `${CD}/resolve/overgrowth/overgrowth.png`,
        description: "Gain permanent max HP when nearby minions or monsters die."
    },
    "Revitalize": {
        url: `${CD}/resolve/revitalize/revitalize.png`,
        description: "Bonus healing and shielding. Increased when healing or shielding allies below 50% HP."
    },
    "Shield Bash": {
        url: `${CD}/resolve/mirrorshell/mirrorshell.png`,
        description: "After gaining a shield, your next basic attack deals bonus adaptive damage."
    },
    "Demolish": {
        url: `${CD}/resolve/demolish/demolish.png`,
        description: "Charge up a powerful attack against a turret while standing near it."
    },
    "Nullifying Orb": {
        url: `${CD}/sorcery/nullifyingorb/pokeshield.png`,
        description: "Gain a magic damage shield when magic damage would reduce your HP below a threshold."
    },
    "Loyalty": {
        url: `${WIKI}/a/af/Loyalty_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102840`,
        description: "Grant bonus armor and magic resistance to you and a nearby ally."
    },
    "Backbone": {
        url: `${WIKI}/a/af/Loyalty_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102840`,
        description: "Gain bonus armor or magic resistance, whichever you have less of."
    },
    "Hunter - Titan": {
        url: `${WIKI}/a/af/Loyalty_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102840`,
        description: "Gain bonus max HP. Unique champion takedowns grant tenacity."
    },
    "Spirit Walker": {
        url: `${WIKI}/a/af/Loyalty_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102840`,
        description: "Gain bonus max HP and slow resistance."
    },
    "Regeneration": {
        url: `${WIKI}/a/af/Loyalty_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102840`,
        description: "Regenerate missing health or mana over time (whichever is lower)."
    },
    "Ultimate Shield": {
        url: `${WIKI}/a/af/Loyalty_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102840`,
        description: "After casting your ultimate ability, gain a shield."
    },

    // ── Inspiration minor ────────────────────────────────
    "Manaflow Band": {
        url: `${CD}/sorcery/manaflowband/manaflowband.png`,
        description: "Hitting a champion with an ability permanently increases your max mana, up to a cap."
    },
    "Nimbus Cloak": {
        url: `${CD}/sorcery/nimbuscloak/6361.png`,
        description: "After casting a Summoner Spell, gain a burst of movement speed."
    },
    "Transcendence": {
        url: `${CD}/sorcery/transcendence/transcendence.png`,
        description: "Gain bonus ability haste. Excess CDR converts into adaptive force."
    },
    "Hextech Flashtraption": {
        url: `${CD}/inspiration/hextechflashtraption/hextechflashtraption.png`,
        description: "While Flash is on cooldown, channel to blink to a location with Hexflash."
    },
    "Future's Market": {
        url: `${CD}/inspiration/futuresmarket/futuresmarket.png`,
        description: "Take on debt to purchase items before you have enough gold."
    },
    "Pathfinder": {
        url: `${WIKI}/8/87/Pathfinder_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713103015`,
        description: "Gain bonus movement speed when moving through jungle or river."
    },
    "Mastermind": {
        url: `${WIKI}/5/5d/Mastermind_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102925`,
        description: "Deal bonus true damage to epic monsters and turrets. Gain bonus gold and XP for taking them down."
    },
    "Hunter - Genius": {
        url: `${WIKI}/e/e7/Hunter_-_Genius_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102756`,
        description: "Gain ability haste. Unique champion takedowns grant additional ability haste."
    },
    "Sweet Tooth": {
        url: `${WIKI}/5/5d/Mastermind_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102925`,
        description: "Increases Honeyfruit healing and grants bonus gold when consuming it."
    },
    "Pack Hunter": {
        url: `${WIKI}/c/cd/Pack_Hunter_%28Wild_Rift%29_rune.png/revision/latest?cb=20200713102951`,
        description: "Gain bonus movement speed near allies. Unique ally takedowns grant bonus gold."
    },
};

export function getRuneImageUrl(runeName: string): string | null {
    return runeData[runeName]?.url ?? null;
}

export function getRuneDescription(runeName: string): string {
    return runeData[runeName]?.description ?? runeName;
}

export function getRuneColor(runeName: string): string {
    const keystones = ['Electrocute', 'Conqueror', 'Fleet Footwork', 'Lethal Tempo',
        'Grasp of the Undying', 'Aftershock', 'Dark Harvest', 'Phase Rush',
        'First Strike', 'Glacial Augment', 'Aery', 'Font of Life', 'Kraken Slayer'];
    if (keystones.includes(runeName)) return '#f59e0b';

    const domination = ['Brutal', 'Gathering Storm', 'Weakness', 'Scorch',
        'Giant Slayer', 'Sudden Impact', 'Champion', 'Hunter - Vampirism',
        'Empowered Attack', 'Cheap Shot', 'Eyeball Collector', 'Zombie Ward'];
    if (domination.includes(runeName)) return '#ef4444';

    const resolve = ['Conditioning', 'Second Wind', 'Bone Plating', 'Backbone',
        'Hunter - Titan', 'Spirit Walker', 'Loyalty', 'Overgrowth', 'Revitalize',
        'Shield Bash', 'Demolish', 'Nullifying Orb', 'Regeneration', 'Ultimate Shield'];
    if (resolve.includes(runeName)) return '#22c55e';

    return '#0ea5e9';
}
