import db from '../database/connection.ts';
import { counterpickData } from '../data/counterpickData.ts';
import { championBuilds } from '../data/championBuilds.ts';
import { championRunes } from '../data/championRunes.ts';

export async function seedCounterData(skipConnect = false) {
    console.log('🌱 Starting Counterpick Data Seeding...');

    // Only connect if called standalone (not from initDb which is already connected)
    if (!skipConnect) await db.connect();

    try {
        await db.transaction(async (client) => {
            // 1. Insert Champions First
            console.log(`Inserting ${counterpickData.length} champions...`);
            const championIdMap: Record<string, string> = {};

            for (const champ of counterpickData) {
                const res = await client.query(
                    `INSERT INTO champions (name, roles, power_spikes) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO UPDATE SET roles = EXCLUDED.roles, power_spikes = EXCLUDED.power_spikes
         RETURNING id`,
                    [champ.name, champ.role, champ.powerSpikes]
                );
                championIdMap[champ.name] = res.rows[0].id;
            }

            // 2. Insert Champion Builds (Top 3 Ranks)
            console.log(`Inserting ${Object.keys(championBuilds).length * 3} champion builds...`);

            for (const [champName, build] of Object.entries(championBuilds)) {
                const champId = championIdMap[champName];
                if (champId) {
                    const situational = build.situational || [];

                    // Rank 1 Build: The standard core build
                    const rank1Core = [...(build.core || [])];
                    const rank1Boots = build.boots || 'Basic Boots';
                    const rank1Enchant = build.enchant || 'Stasis';

                    // Rank 2 Build: A variation replacing the 4th core item with a situational item if available
                    let rank2Core = [...(build.core || [])];
                    if (situational.length > 0 && rank2Core.length > 0) {
                        rank2Core[rank2Core.length - 1] = situational[0];
                    }
                    const rank2Boots = build.boots || 'Basic Boots';
                    const rank2Enchant = situational.length > 2 ? situational[2] : (build.enchant || 'Stasis'); // Fake variation

                    // Rank 3 Build: Another variation replacing the 3rd core item if available
                    let rank3Core = [...(build.core || [])];
                    if (situational.length > 1 && rank3Core.length > 2) {
                        rank3Core[rank3Core.length - 2] = situational[1];
                    }

                    const buildsToInsert = [
                        { rank: 1, core: rank1Core, boots: rank1Boots, enchant: rank1Enchant },
                        { rank: 2, core: rank2Core, boots: rank2Boots, enchant: rank2Enchant },
                        { rank: 3, core: rank3Core, boots: (build.boots || 'Basic Boots'), enchant: (build.enchant || 'Stasis') }
                    ];

                    for (const b of buildsToInsert) {
                        await client.query(
                            `INSERT INTO champion_builds (champion_id, rank, core_items, boots, enchant, situational_items)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             ON CONFLICT (champion_id, rank) DO UPDATE 
                             SET core_items = EXCLUDED.core_items,
                                 boots = EXCLUDED.boots,
                                 enchant = EXCLUDED.enchant,
                                 situational_items = EXCLUDED.situational_items`,
                            [champId, b.rank, b.core, b.boots, b.enchant, situational]
                        );
                    }
                } else {
                    console.warn(`⚠️ Warning: No champion ID found for build ${champName}`);
                }
            }

            // 3. Insert Runes
            console.log(`Inserting ${Object.keys(championRunes).length} runes...`);
            for (const [champName, runes] of Object.entries(championRunes)) {
                const id = championIdMap[champName];
                if (!id) {
                    console.warn(`⚠️ Warning: No champion ID found for runes ${champName}`);
                    continue;
                }

                await client.query(
                    `INSERT INTO champion_runes (champion_id, keystone, domination, resolve, inspiration) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (champion_id, patch_version) DO UPDATE SET 
            keystone = EXCLUDED.keystone,
            domination = EXCLUDED.domination,
            resolve = EXCLUDED.resolve,
            inspiration = EXCLUDED.inspiration`,
                    [id, runes.keystone, runes.domination, runes.resolve, runes.inspiration]
                );
            }

            // 4. Insert Matchups (Counters)
            console.log(`Inserting Matchups...`);
            let matchupCount = 0;
            for (const champ of counterpickData) {
                const champId = championIdMap[champ.name];
                if (!champId) continue;

                for (const counter of champ.counters) {
                    const enemyId = championIdMap[counter.name];

                    // Sometimes counters refer to generic things like "Ignite users" - handle those or skip if they aren't real champs
                    if (!enemyId) {
                        console.warn(`⚠️ Warning: Counter '${counter.name}' for ${champ.name} not found in champion list. Skipping database relation.`);
                        continue;
                    }

                    await client.query(
                        `INSERT INTO matchups (champion_id, enemy_id, matchup_details, win_conditions, weaknesses)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (champion_id, enemy_id) DO UPDATE SET
             matchup_details = EXCLUDED.matchup_details,
             win_conditions = EXCLUDED.win_conditions,
             weaknesses = EXCLUDED.weaknesses`,
                        [
                            enemyId, // The person BEING countered is 'enemy_id' (e.g. Aatrox)
                            champId, // The person DOING the countering is 'champion_id' (e.g. Fiora)
                            counter.reason,
                            JSON.stringify(champ.winConditions || []),
                            JSON.stringify(champ.weaknesses || [])
                        ]
                    );
                    matchupCount++;
                }
            }
            console.log(`Inserted/Updated ${matchupCount} exact matchups.`);
        }); // transaction commits automatically

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await db.disconnect();
        process.exit(0); // Exit the script process
    }
}

import { fileURLToPath } from 'url';
import * as path from 'path';

// Execute if run directly
const isMain = process.argv[1] && import.meta.url.toLowerCase().includes(path.basename(process.argv[1]).toLowerCase());
if (isMain) {
    seedCounterData().catch(console.error);
}
