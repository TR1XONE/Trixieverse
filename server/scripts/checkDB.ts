import db from '../database/connection.js';

async function check() {
    await db.connect();

    // Check Kayle
    const champRes = await db.query("SELECT id FROM champions WHERE name = 'Kayle'");
    if (champRes.rows.length === 0) {
        console.log("Kayle not found.");
        return;
    }
    const champId = champRes.rows[0].id;

    const buildRes = await db.query("SELECT * FROM champion_builds WHERE champion_id = $1", [champId]);
    console.log("Builds for Kayle:", JSON.stringify(buildRes.rows, null, 2));

    const runeRes = await db.query("SELECT * FROM champion_runes WHERE champion_id = $1", [champId]);
    console.log("Runes for Kayle:", JSON.stringify(runeRes.rows, null, 2));

    process.exit(0);
}

check().catch(console.error);
