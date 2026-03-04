import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'trixieverse',
    user: process.env.DB_USER || 'trixieverse',
    password: process.env.DB_PASSWORD || 'dev_password',
});

// Real Wild Rift skill order data — format: [max_first, max_second, max_third, ult]
// Using ability numbers (1, 2, 3, Ult) as in Wild Rift
const skillOrders: Record<string, string[]> = {
    'Aatrox': ['1', '3', '2', 'Ult'],
    'Ahri': ['3', '1', '2', 'Ult'],
    'Akali': ['1', '3', '2', 'Ult'],
    'Akshan': ['1', '3', '2', 'Ult'],
    'Alistar': ['2', '1', '3', 'Ult'],
    'Amumu': ['3', '1', '2', 'Ult'],
    'Annie': ['1', '3', '2', 'Ult'],
    'Ashe': ['1', '3', '2', 'Ult'],
    'Aurelion Sol': ['1', '3', '2', 'Ult'],
    'Blitzcrank': ['1', '3', '2', 'Ult'],
    'Brand': ['2', '1', '3', 'Ult'],
    'Braum': ['1', '3', '2', 'Ult'],
    'Caitlyn': ['1', '3', '2', 'Ult'],
    'Camille': ['1', '3', '2', 'Ult'],
    'Corki': ['1', '3', '2', 'Ult'],
    'Darius': ['1', '3', '2', 'Ult'],
    'Diana': ['1', '3', '2', 'Ult'],
    'Dr. Mundo': ['1', '3', '2', 'Ult'],
    'Draven': ['1', '3', '2', 'Ult'],
    'Ekko': ['1', '3', '2', 'Ult'],
    'Evelynn': ['1', '3', '2', 'Ult'],
    'Ezreal': ['1', '3', '2', 'Ult'],
    'Fiora': ['1', '3', '2', 'Ult'],
    'Fizz': ['1', '3', '2', 'Ult'],
    'Galio': ['1', '3', '2', 'Ult'],
    'Garen': ['3', '1', '2', 'Ult'],
    'Gragas': ['1', '3', '2', 'Ult'],
    'Graves': ['1', '3', '2', 'Ult'],
    'Gwen': ['1', '3', '2', 'Ult'],
    'Irelia': ['1', '3', '2', 'Ult'],
    'Janna': ['3', '1', '2', 'Ult'],
    'Jarvan IV': ['1', '3', '2', 'Ult'],
    'Jax': ['1', '3', '2', 'Ult'],
    'Jayce': ['1', '3', '2', 'Ult'],
    'Jhin': ['1', '3', '2', 'Ult'],
    'Jinx': ['1', '3', '2', 'Ult'],
    'Kai\'Sa': ['1', '2', '3', 'Ult'],
    'Karma': ['1', '3', '2', 'Ult'],
    'Kassadin': ['1', '3', '2', 'Ult'],
    'Katarina': ['1', '3', '2', 'Ult'],
    'Kennen': ['1', '3', '2', 'Ult'],
    'Kha\'Zix': ['1', '3', '2', 'Ult'],
    'Lee Sin': ['1', '3', '2', 'Ult'],
    'Leona': ['2', '1', '3', 'Ult'],
    'Lissandra': ['1', '3', '2', 'Ult'],
    'Lucian': ['1', '3', '2', 'Ult'],
    'Lulu': ['1', '3', '2', 'Ult'],
    'Lux': ['1', '3', '2', 'Ult'],
    'Malphite': ['1', '3', '2', 'Ult'],
    'Miss Fortune': ['1', '3', '2', 'Ult'],
    'Mordekaiser': ['1', '3', '2', 'Ult'],
    'Morgana': ['1', '3', '2', 'Ult'],
    'Nami': ['2', '1', '3', 'Ult'],
    'Nasus': ['1', '3', '2', 'Ult'],
    'Nautilus': ['1', '3', '2', 'Ult'],
    'Olaf': ['1', '3', '2', 'Ult'],
    'Orianna': ['1', '3', '2', 'Ult'],
    'Pantheon': ['1', '3', '2', 'Ult'],
    'Poppy': ['3', '1', '2', 'Ult'],
    'Rakan': ['2', '3', '1', 'Ult'],
    'Rammus': ['3', '1', '2', 'Ult'],
    'Renekton': ['1', '3', '2', 'Ult'],
    'Rengar': ['1', '3', '2', 'Ult'],
    'Riven': ['1', '3', '2', 'Ult'],
    'Senna': ['1', '3', '2', 'Ult'],
    'Seraphine': ['1', '3', '2', 'Ult'],
    'Sett': ['1', '3', '2', 'Ult'],
    'Shyvana': ['3', '1', '2', 'Ult'],
    'Singed': ['3', '1', '2', 'Ult'],
    'Tristana': ['1', '3', '2', 'Ult'],
    'Tryndamere': ['1', '3', '2', 'Ult'],
    'Twisted Fate': ['1', '3', '2', 'Ult'],
    'Varus': ['1', '3', '2', 'Ult'],
    'Vayne': ['1', '3', '2', 'Ult'],
    'Vi': ['1', '3', '2', 'Ult'],
    'Vladimir': ['1', '3', '2', 'Ult'],
    'Wukong': ['1', '3', '2', 'Ult'],
    'Xayah': ['1', '3', '2', 'Ult'],
    'Xin Zhao': ['1', '3', '2', 'Ult'],
    'Yasuo': ['1', '3', '2', 'Ult'],
    'Zed': ['1', '3', '2', 'Ult'],
    'Ziggs': ['1', '3', '2', 'Ult'],
    'Zilean': ['2', '1', '3', 'Ult'],
    'Zoe': ['1', '3', '2', 'Ult'],
    'Zyra': ['3', '1', '2', 'Ult'],
};

async function run() {
    const client = await pool.connect();
    try {
        // 1. Add column if it doesn't exist
        await client.query(`
            ALTER TABLE champions
            ADD COLUMN IF NOT EXISTS skill_order VARCHAR(10)[] DEFAULT '{}'
        `);
        console.log('✅ skill_order column added (or already exists)');

        // 2. Update each champion with their skill order
        let updated = 0;
        for (const [name, order] of Object.entries(skillOrders)) {
            const result = await client.query(
                `UPDATE champions SET skill_order = $1 WHERE LOWER(name) = LOWER($2)`,
                [order, name]
            );
            if (result.rowCount && result.rowCount > 0) {
                updated++;
                console.log(`  ✔ ${name}: [${order.join(' → ')}]`);
            } else {
                console.log(`  ⚠ Not found in DB: ${name}`);
            }
        }
        console.log(`\n✅ Updated skill_order for ${updated} champions.`);
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
