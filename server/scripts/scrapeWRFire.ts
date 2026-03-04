import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { counterpickData } from '../data/counterpickData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function optimizeChampionName(name: string) {
    name = name.toLowerCase();

    // Exact overrides for wildriftfire.com URL slugs
    if (name === "nunu & willump") return "nunu";
    if (name === "dr. mundo") return "dr-mundo";
    if (name === "wukong") return "wukong";

    // Remove apostrophes, dots, and spaces -> dashes
    return name.replace(/['\.]+/g, '').replace(/\s+/g, '-');
}

async function scrape() {
    console.log(`Starting scrape of ${counterpickData.length} champions...`);

    const newBuilds: any = {};
    const newRunes: any = {};

    for (const champ of counterpickData) {
        const slug = optimizeChampionName(champ.name);
        try {
            const res = await fetch(`https://www.wildriftfire.com/guide/${slug}`);
            if (!res.ok) {
                console.log(`⚠️ Failed to fetch guide for ${champ.name} (${slug}) - Status: ${res.status}`);
                continue;
            }

            const html = await res.text();
            const $ = cheerio.load(html);

            // Extract builds - we look for the main build container
            // Usually there are multiple item blocks. We will grab all items and filter out duplicates, taking the most common complete build.
            // Or simpler: just grab the specific "Core Build" block
            let items: string[] = [];
            $('.mb-5').each((_, el) => {
                const title = $(el).find('h4').text().trim().toLowerCase();
                if (title.includes('core build') || title.includes('full build') || title === 'build') {
                    $(el).find('img').each((_, img) => {
                        const src = $(img).attr('src') || '';
                        if (src.includes('/items/')) {
                            items.push($(img).attr('alt') || '');
                        }
                    });
                }
            });

            // If empty, fallback to picking up the first 6 unique items we find anywhere
            if (items.length === 0) {
                $('img').each((_, img) => {
                    const src = $(img).attr('src') || '';
                    if (src.includes('/items/')) {
                        items.push($(img).attr('alt') || '');
                    }
                });
            }

            // Clean array and deduplicate while maintaining order
            items = [...new Set(items.filter(Boolean))];

            // Extract runes
            let runesList: string[] = [];
            $('img').each((_, img) => {
                const src = $(img).attr('src') || '';
                if (src.includes('/runes/')) {
                    runesList.push($(img).attr('alt') || '');
                }
            });
            runesList = [...new Set(runesList.filter(Boolean))];

            if (items.length > 0) {
                // Approximate categorization
                const isEnchant = (item: string) => /Stasis|Locket|Quicksilver|Protobelt|Redemption|Repulsor|Meteor|Teleport|Magnetron|Veil/.test(item);
                const isBoots = (item: string) => /Boots|Treads|Greaves|Steelcaps/.test(item);

                let enchant = items.find(isEnchant) || 'Stasis';
                let boots = items.find(isBoots) || 'Ionian Boots of Lucidity';
                let core = items.filter(i => !isEnchant(i) && !isBoots(i)).slice(0, 4);

                newBuilds[champ.name] = { core, boots, enchant };
            }

            if (runesList.length >= 4) {
                newRunes[champ.name] = {
                    keystone: runesList[0],
                    domination: runesList[1],
                    resolve: runesList[2],
                    inspiration: runesList[3]
                };
            }

            console.log(`✅ Scraped ${champ.name}`);
        } catch (err) {
            console.error(`❌ Error scraping ${champ.name}:`, err);
        }
    }

    // Write to files
    const buildsFile = Object.entries(newBuilds)
        .map(([c, b]: any) => `    "${c}": { core: ${JSON.stringify(b.core)}, boots: "${b.boots}", enchant: "${b.enchant}" },`)
        .join('\n');

    const runesFile = Object.entries(newRunes)
        .map(([c, r]: any) => `    "${c}": { keystone: "${r.keystone}", domination: "${r.domination}", resolve: "${r.resolve}", inspiration: "${r.inspiration}" },`)
        .join('\n');

    const buildsOutput = `export interface ChampionBuild {
    core: string[];
    boots: string;
    enchant: string;
    situational?: string[];
}

export const championBuilds: Record<string, ChampionBuild> = {
${buildsFile}
};
`;

    const runesOutput = `export interface ChampionRunes {
    keystone: string;
    domination: string;
    resolve: string;
    inspiration: string;
}

export const championRunes: Record<string, ChampionRunes> = {
${runesFile}
};
`;

    fs.writeFileSync(path.join(__dirname, '../data/championBuildsWR.ts'), buildsOutput);
    fs.writeFileSync(path.join(__dirname, '../data/championRunesWR.ts'), runesOutput);
    console.log('🎉 Scraping complete! Saved to championBuildsWR.ts and championRunesWR.ts');
}

scrape();
