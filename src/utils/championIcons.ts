export function getChampionImageUrl(name: string): string {
    // DD doesn't always strictly follow standard rules for all champs
    const overrides: Record<string, string> = {
        "Wukong": "MonkeyKing",
        "Nunu & Willump": "Nunu",
        "Kha'Zix": "Khazix",
        "Kai'Sa": "Kaisa",
        "Cho'Gath": "Chogath",
        "Vel'Koz": "Velkoz",
        "LeBlanc": "Leblanc",
        "Renata Glasc": "Renata"
    };

    let formatted = overrides[name];
    if (!formatted) {
        // Remove spaces, dots, and apostrophes. Preserve camelCase naturally from the display name
        formatted = name.replace(/['\.\s]/g, '');
    }

    return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${formatted}.png`;
}
