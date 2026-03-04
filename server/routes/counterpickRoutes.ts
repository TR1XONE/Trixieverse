import { Router, Request, Response } from 'express';
import db from '../database/connection';

const router = Router();

// GET /api/counterpick/champions  – all champion names for autocomplete
router.get('/champions', async (_req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT name FROM champions ORDER BY name ASC');
        res.json(result.rows.map(row => row.name));
    } catch (error) {
        console.error('Error fetching champions:', error);
        res.status(500).json({ error: 'Failed to load champions' });
    }
});

// GET /api/counterpick/:champion  – full counterpick data enriched with builds & runes
router.get('/:champion', async (req: Request, res: Response) => {
    try {
        const champName = req.params.champion.toLowerCase();

        // Find champion ID (case-insensitive)
        const champRes = await db.query(
            'SELECT * FROM champions WHERE LOWER(name) = $1',
            [champName]
        );

        if (champRes.rows.length === 0) {
            return res.status(404).json({ error: 'Champion not found' });
        }

        const champion = champRes.rows[0];

        // Fetch their own build and runes
        const buildRes = await db.query('SELECT * FROM champion_builds WHERE champion_id = $1 ORDER BY patch_version DESC LIMIT 1', [champion.id]);
        const runeRes = await db.query('SELECT * FROM champion_runes WHERE champion_id = $1 ORDER BY patch_version DESC LIMIT 1', [champion.id]);

        // Fetch counters (who counters this champion)
        // enemy_id = the champion being countered
        // champion_id = the champion doing the countering
        const countersQuery = `
            SELECT 
                c.name, 
                m.matchup_details as reason,
                cb.core_items, cb.boots, cb.enchant, cb.situational,
                cr.keystone, cr.domination, cr.resolve, cr.inspiration
            FROM matchups m
            JOIN champions c ON m.champion_id = c.id
            LEFT JOIN champion_builds cb ON c.id = cb.champion_id
            LEFT JOIN champion_runes cr ON c.id = cr.champion_id
            WHERE m.enemy_id = $1
            ORDER BY m.tier ASC
        `;
        const countersRes = await db.query(countersQuery, [champion.id]);

        const formatBuild = (b: any) => b ? { core: b.core_items, boots: b.boots, enchant: b.enchant, situational: b.situational } : null;
        const formatRunes = (r: any) => r ? { keystone: r.keystone, domination: r.domination, resolve: r.resolve, inspiration: r.inspiration } : null;

        // Since win_conditions and weaknesses were stored at the matchup level in the seed data, 
        // we'll pull them from the first counter (or keep them empty if no counters exist)
        // In a true relational model, these might belong to the champion themselves based on the seed data schema.
        // Let's grab the first matchup to extract those global hints if they exist.
        const firstMatchup = await db.query('SELECT win_conditions, weaknesses FROM matchups WHERE enemy_id = $1 LIMIT 1', [champion.id]);

        const winConditions = firstMatchup.rows.length > 0 && firstMatchup.rows[0].win_conditions ? firstMatchup.rows[0].win_conditions : [];
        const weaknesses = firstMatchup.rows.length > 0 && firstMatchup.rows[0].weaknesses ? firstMatchup.rows[0].weaknesses : [];

        const enriched = {
            name: champion.name,
            role: champion.roles,
            powerSpikes: champion.power_spikes,
            winConditions: typeof winConditions === 'string' ? JSON.parse(winConditions) : winConditions,
            weaknesses: typeof weaknesses === 'string' ? JSON.parse(weaknesses) : weaknesses,
            selfBuild: formatBuild(buildRes.rows[0]),
            selfRunes: formatRunes(runeRes.rows[0]),
            counters: countersRes.rows.map(row => ({
                name: row.name,
                reason: row.reason,
                build: formatBuild(row),
                runes: formatRunes(row)
            }))
        };

        res.json(enriched);
    } catch (error) {
        console.error('Error fetching champion details:', error);
        res.status(500).json({ error: 'Failed to load counterpick data' });
    }
});

// POST /api/counterpick/migrate-skill-order  — one-time migration to seed skill_order column
router.post('/migrate-skill-order', async (_req: Request, res: Response) => {
    const skillOrders: Record<string, string[]> = {
        'Aatrox': ['1', '3', '2', 'Ult'], 'Ahri': ['3', '1', '2', 'Ult'], 'Akali': ['1', '3', '2', 'Ult'],
        'Akshan': ['1', '3', '2', 'Ult'], 'Alistar': ['2', '1', '3', 'Ult'], 'Amumu': ['3', '1', '2', 'Ult'],
        'Annie': ['1', '3', '2', 'Ult'], 'Ashe': ['1', '3', '2', 'Ult'], 'Aurelion Sol': ['1', '3', '2', 'Ult'],
        'Blitzcrank': ['1', '3', '2', 'Ult'], 'Brand': ['2', '1', '3', 'Ult'], 'Braum': ['1', '3', '2', 'Ult'],
        'Caitlyn': ['1', '3', '2', 'Ult'], 'Camille': ['1', '3', '2', 'Ult'], 'Corki': ['1', '3', '2', 'Ult'],
        'Darius': ['1', '3', '2', 'Ult'], 'Diana': ['1', '3', '2', 'Ult'], 'Dr. Mundo': ['1', '3', '2', 'Ult'],
        'Draven': ['1', '3', '2', 'Ult'], 'Ekko': ['1', '3', '2', 'Ult'], 'Evelynn': ['1', '3', '2', 'Ult'],
        'Ezreal': ['1', '3', '2', 'Ult'], 'Fiora': ['1', '3', '2', 'Ult'], 'Fizz': ['1', '3', '2', 'Ult'],
        'Galio': ['1', '3', '2', 'Ult'], 'Garen': ['3', '1', '2', 'Ult'], 'Gragas': ['1', '3', '2', 'Ult'],
        'Graves': ['1', '3', '2', 'Ult'], 'Gwen': ['1', '3', '2', 'Ult'], 'Irelia': ['1', '3', '2', 'Ult'],
        'Janna': ['3', '1', '2', 'Ult'], 'Jarvan IV': ['1', '3', '2', 'Ult'], 'Jax': ['1', '3', '2', 'Ult'],
        'Jayce': ['1', '3', '2', 'Ult'], 'Jhin': ['1', '3', '2', 'Ult'], 'Jinx': ['1', '3', '2', 'Ult'],
        'Kai\'Sa': ['1', '2', '3', 'Ult'], 'Karma': ['1', '3', '2', 'Ult'], 'Kassadin': ['1', '3', '2', 'Ult'],
        'Katarina': ['1', '3', '2', 'Ult'], 'Kennen': ['1', '3', '2', 'Ult'], 'Kha\'Zix': ['1', '3', '2', 'Ult'],
        'Lee Sin': ['1', '3', '2', 'Ult'], 'Leona': ['2', '1', '3', 'Ult'], 'Lissandra': ['1', '3', '2', 'Ult'],
        'Lucian': ['1', '3', '2', 'Ult'], 'Lulu': ['1', '3', '2', 'Ult'], 'Lux': ['1', '3', '2', 'Ult'],
        'Malphite': ['1', '3', '2', 'Ult'], 'Miss Fortune': ['1', '3', '2', 'Ult'], 'Mordekaiser': ['1', '3', '2', 'Ult'],
        'Morgana': ['1', '3', '2', 'Ult'], 'Nami': ['2', '1', '3', 'Ult'], 'Nasus': ['1', '3', '2', 'Ult'],
        'Nautilus': ['1', '3', '2', 'Ult'], 'Olaf': ['1', '3', '2', 'Ult'], 'Orianna': ['1', '3', '2', 'Ult'],
        'Pantheon': ['1', '3', '2', 'Ult'], 'Poppy': ['3', '1', '2', 'Ult'], 'Rakan': ['2', '3', '1', 'Ult'],
        'Rammus': ['3', '1', '2', 'Ult'], 'Renekton': ['1', '3', '2', 'Ult'], 'Rengar': ['1', '3', '2', 'Ult'],
        'Riven': ['1', '3', '2', 'Ult'], 'Senna': ['1', '3', '2', 'Ult'], 'Seraphine': ['1', '3', '2', 'Ult'],
        'Sett': ['1', '3', '2', 'Ult'], 'Shyvana': ['3', '1', '2', 'Ult'], 'Singed': ['3', '1', '2', 'Ult'],
        'Tristana': ['1', '3', '2', 'Ult'], 'Tryndamere': ['1', '3', '2', 'Ult'], 'Twisted Fate': ['1', '3', '2', 'Ult'],
        'Varus': ['1', '3', '2', 'Ult'], 'Vayne': ['1', '3', '2', 'Ult'], 'Vi': ['1', '3', '2', 'Ult'],
        'Vladimir': ['1', '3', '2', 'Ult'], 'Wukong': ['1', '3', '2', 'Ult'], 'Xayah': ['1', '3', '2', 'Ult'],
        'Xin Zhao': ['1', '3', '2', 'Ult'], 'Yasuo': ['1', '3', '2', 'Ult'], 'Zed': ['1', '3', '2', 'Ult'],
        'Ziggs': ['1', '3', '2', 'Ult'], 'Zilean': ['2', '1', '3', 'Ult'], 'Zoe': ['1', '3', '2', 'Ult'],
        'Zyra': ['3', '1', '2', 'Ult'],
    };
    try {
        // Add column if not exists
        await db.query(`ALTER TABLE champions ADD COLUMN IF NOT EXISTS skill_order VARCHAR(10)[] DEFAULT '{}'`);
        let updated = 0;
        for (const [name, order] of Object.entries(skillOrders)) {
            const r = await db.query(`UPDATE champions SET skill_order = $1 WHERE LOWER(name) = LOWER($2)`, [order, name]);
            if (r.rowCount && r.rowCount > 0) updated++;
        }
        res.json({ success: true, updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
});

export default router;
