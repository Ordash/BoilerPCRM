const { Pool, Client } = require('pg');

const env = process.env;

const pool = new Pool({
    user: env.PGUSER,
    host: env.PGHOST,
    database: env.PGDATABASE,
    password: env.PGPASSWORD,
    port: env.PGPORT
})
console.log("Pool created!")

async function selectNowAndPrint() {
    const res = await pool.query('SELECT * FROM persons')
    await pool.end()
    console.log(res.rows);
}

selectNowAndPrint()


