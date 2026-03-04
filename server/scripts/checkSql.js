import pg from 'pg';
const { Pool } = pg;

async function check() {
    const pool = new Pool({
        user: 'trixieverse',
        password: 'dev_password',
        host: 'localhost',
        port: 5432,
        database: 'trixieverse'
    });

    const res = await pool.query(`
        SELECT c.name, cb.core_items, cb.patch_version 
        FROM champions c 
        JOIN champion_builds cb ON c.id = cb.champion_id 
        WHERE c.name = 'Ahri'
    `);

    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}
check();
