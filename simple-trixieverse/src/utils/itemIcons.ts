// Maps Wild Rift item names → League Data Dragon item IDs + descriptions
// CDN: https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/{id}.png
// WR-exclusive items use Fandom wiki CDN instead

export const DDRAGON_VERSION = '14.4.1';
const WIKI = 'https://static.wikia.nocookie.net/leagueoflegends/images';

interface ItemInfo {
    id: number | null;
    description: string;
}

export const itemData: Record<string, ItemInfo & { wikiUrl?: string }> = {
    // AD / Bruiser
    "Black Cleaver": { id: 3071, description: "Grants AD, HP, and ability haste. Attacks shred target armor, stacking up to 6 times." },
    "Death's Dance": { id: 6333, description: "Grants AD, armor, and ability haste. Stores damage taken as a bleed. Takedowns cleanse the bleed and heal you." },
    "Trinity Force": { id: 3078, description: "Grants AD, AS, HP, and ability haste. Spellblade: after using an ability, next attack deals bonus damage." },
    "Sterak's Gage": { id: 3053, description: "Grants AD and HP. Lifeline: when taking burst damage, gain a large shield." },
    "Divine Sunderer": { id: 6632, description: "Grants AD, HP, and ability haste. Spellblade: next attack deals bonus %HP damage and heals you." },
    "Hullbreaker": { id: 3181, description: "Grants AD and HP. While alone, gain bonus armor, MR, and deal increased damage to turrets." },
    "Blade of the Ruined King": { id: 3153, description: "Grants AD, AS, and lifesteal. Attacks deal bonus %current HP damage. Active: steal movement speed." },
    "Guardian Angel": { id: 3026, description: "Grants AD and armor. Upon death, revive with 50% base HP and 30% max mana after a brief stasis." },
    "Serylda's Grudge": { id: 6694, description: "Grants AD, ability haste, and armor penetration. Abilities slow targets hit." },
    "Manamune": { id: 3004, description: "Grants AD and mana. Stacks mana on attacks and ability use. Transforms into Muramana at max stacks." },
    "Stormrazor": { id: 3095, description: "Grants AD, AS, and crit. Energized attacks deal bonus magic damage and slow the target." },
    "Essence Reaver": { id: 3508, description: "Grants AD, crit, and ability haste. Spellblade: next attack after using ability restores mana." },
    "Navori Quickblades": { id: 6675, description: "Grants AD, crit, and ability haste. Critical strikes reduce non-ultimate ability cooldowns." },

    // Crit / ADC
    "Infinity Edge": { id: 3031, description: "Grants AD and crit chance. Critical strikes deal increased damage." },
    "Phantom Dancer": { id: 3046, description: "Grants AS, crit, and movement speed. Attacks grant stacking AS. At max stacks gain ghosting." },
    "Rapid Firecannon": { id: 3094, description: "Grants AS, crit, and movement speed. Energized attacks gain extra range and deal bonus magic damage." },
    "Runaan's Hurricane": { id: 3085, description: "Grants AS, crit, and movement speed. Attacks fire bolts at 2 nearby enemies." },
    "Mortal Reminder": { id: 3033, description: "Grants AD, crit, and armor penetration. Attacks apply Grievous Wounds, reducing healing." },
    "Bloodthirster": { id: 3072, description: "Grants AD and lifesteal. Excess healing creates a shield that decays over time." },

    // AP / Mage
    "Rabadon's Deathcap": { id: 3089, description: "Grants a large amount of AP. Passive: increases your total AP by 40%." },
    "Void Staff": { id: 3135, description: "Grants AP and 40% magic penetration." },
    "Lich Bane": { id: 3100, description: "Grants AP, ability haste, and movement speed. Spellblade: next attack deals bonus magic damage." },
    "Nashor's Tooth": { id: 3115, description: "Grants AP and AS. Attacks deal bonus magic damage on-hit." },
    "Rod of Ages": { id: 3003, description: "Grants AP, HP, and mana. Stats increase over time up to 10 stacks. Stacks restore health and mana." },
    "Rylai's Crystal Scepter": { id: 3116, description: "Grants AP and HP. Abilities slow enemies hit." },
    "Luden's Echo": { id: 3285, description: "Grants AP, mana, and ability haste. Damaging abilities deal bonus AoE magic damage periodically." },
    "Liandry's Torment": { id: 6653, description: "Grants AP, HP, and ability haste. Abilities burn enemies for %max HP magic damage over time." },
    "Riftmaker": { id: 4633, description: "Grants AP, HP, and omnivamp. Deal increasing bonus true damage as you stay in combat." },
    "Hextech Gunblade": { id: 3146, description: "Grants AD, AP, and omnivamp. Active: deals magic damage and slows a target champion." },
    "Infinity Orb": { id: null, wikiUrl: `${WIKI}/7/76/Infinity_Orb_WR_item_HD.png/revision/latest?cb=20210728194347`, description: "Grants 95 AP and 7% magic penetration. Abilities critically strike for 20% bonus damage against enemies below 45% health." },
    "Harmonic Echo": { id: null, wikiUrl: `${WIKI}/a/a8/Harmonic_Echo_WR_item_HD.png/revision/latest?cb=20200617135844`, description: "Grants AP, mana, and CDR. At 100 Harmony stacks (from moving/casting), next heal or shield also restores health to nearby allies." },

    // Lethality / Assassin
    "Duskblade of Draktharr": { id: 6691, description: "Grants AD, ability haste, and lethality. After a champion kill, briefly become untargetable." },
    "Youmuu's Ghostblade": { id: 3142, description: "Grants AD and lethality. Active: gain a burst of movement speed and ghosting." },

    // Tank
    "Sunfire Aegis": { id: 3068, description: "Grants HP, armor, and MR. Burns nearby enemies with immolate. Stacks increase burn damage." },
    "Thornmail": { id: 3075, description: "Grants armor and HP. Reflect magic damage to attackers. Immobilizing enemies applies Grievous Wounds." },
    "Randuin's Omen": { id: 3143, description: "Grants armor and HP. Reduce incoming crit damage. Active: slow nearby enemies." },
    "Dead Man's Plate": { id: 3742, description: "Grants armor, HP, and movement speed. Build momentum while moving; discharge on attack for bonus damage and slow." },
    "Deadman's Plate": { id: 3742, description: "Grants armor, HP, and movement speed. Build momentum while moving; discharge on attack for bonus damage and slow." },
    "Force of Nature": { id: 4401, description: "Grants MR, HP, and movement speed. Taking magic damage stacks Dissipate, granting MR and MS." },
    "Spirit Visage": { id: 3065, description: "Grants MR, HP, ability haste, and HP regen. Increases all healing and shielding received by 25%." },
    "Warmog's Armor": { id: 3083, description: "Grants a massive amount of HP and HP regen. Warmog's Heart: rapidly regenerate HP out of combat." },
    "Abyssal Mask": { id: 8020, description: "Grants HP, MR, and ability haste. Immobilizing enemies causes them to take increased magic damage." },
    "Iceborn Gauntlet": { id: 3110, description: "Grants armor, mana, and ability haste. Spellblade: next attack creates a slowing frost field." },

    // Support
    "Ardent Censer": { id: 3504, description: "Grants AP, mana regen, and heal/shield power. Healing/shielding allies grants them bonus AS and on-hit damage." },
    "Staff of Flowing Water": { id: 6616, description: "Grants AP, mana regen, and heal/shield power. Healing/shielding allies grants AP and ability haste." },
    "Protector's Vow": { id: 3109, description: "Grants HP, armor, and ability haste. Bind to an ally; when they take damage, redirect some to you and grant a shield." },

    // Boots
    "Plated Steelcaps": { id: 3047, description: "Grants armor and movement speed. Reduces damage from basic attacks by 10%." },
    "Mercury's Treads": { id: 3111, description: "Grants MR, movement speed, and tenacity. Reduces duration of crowd control effects." },
    "Berserker's Greaves": { id: 3006, description: "Grants attack speed and movement speed." },
    "Ionian Boots of Lucidity": { id: 3158, description: "Grants ability haste and movement speed. Also reduces summoner spell cooldowns." },

    // Boot Enchants (WR-exclusive, using closest LoL PC item icon)
    "Stasis": { id: 2420, description: "Become invulnerable and untargetable for 2.5s but unable to move or act. 120s cooldown." },
    "Redemption": { id: 3107, description: "After a short delay, heal nearby allies and damage nearby enemies in a large area. Usable while dead." },
    "Quicksilver": { id: 3140, description: "Remove all crowd control effects. 90s cooldown." },
    "Locket": { id: 3190, description: "Shield yourself and nearby allies, absorbing damage for 2.5s." },
    "Teleport": { id: null, description: "Teleport to a target allied structure after channeling for 3.5s." },
    "Gargoyle": { id: 3193, description: "Gain a large shield based on bonus HP for 2.5s. Increases with nearby enemies." },
    "Shadows": { id: 3152, description: "Dash in a direction and unleash a wave of rockets dealing magic damage." },
    "Protobelt": { id: 3152, description: "Dash forward and fire bolts in a cone dealing magic damage." },
    "Glorious": { id: 3800, description: "Gain a large burst of movement speed toward enemy champions or turrets for 4s." },
};

export function getItemImageUrl(itemName: string): string | null {
    const info = itemData[itemName];
    if (!info) return null;
    if (info.wikiUrl) return info.wikiUrl;
    if (info.id == null) return null;
    return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${info.id}.png`;
}

export function getItemDescription(itemName: string): string {
    return itemData[itemName]?.description ?? itemName;
}

// Generate a color based on item name for fallback icons
export function getItemColor(itemName: string): string {
    const lower = itemName.toLowerCase();
    if (lower.includes('blade') || lower.includes('edge') || lower.includes('cleaver') || lower.includes('bloodthirster'))
        return '#ef4444';
    if (lower.includes('deathcap') || lower.includes('void') || lower.includes('lich') || lower.includes('echo') || lower.includes('orb'))
        return '#8b5cf6';
    if (lower.includes('armor') || lower.includes('thornmail') || lower.includes('plate') || lower.includes('omen') || lower.includes('aegis'))
        return '#22c55e';
    if (lower.includes('censer') || lower.includes('staff') || lower.includes('vow') || lower.includes('harmonic'))
        return '#f59e0b';
    return '#0ea5e9';
}
