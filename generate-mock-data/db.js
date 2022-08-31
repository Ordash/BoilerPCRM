const { Pool } = require('pg')

const env = process.env;

const pool = new Pool({
    user: env.PGUSER,
    host: env.PGHOST,
    database: env.PGDATABASE,
    password: env.PGPASSWORD,
    port: env.PGPORT
})
console.log("Pool created!")

const tables = {
    EMPLOYEE: {
        name: 'employee',
        fields: {
            ID: 'id',
            NAME: 'name',
            EMAIL: 'email'
        }
    },
    CLIENT: {
        name: 'client',
        fields: {
            ID: 'id',
            NAME: 'name',
            EMAIL: 'email'
        }
    }
}

const comaSeparatedTableNames = Object.keys(tables).map(key => tables[key].name).join(", ")

async function closePool() {
    await pool.end();
}

async function dropTables() {
    const dropQuery = `DROP TABLE ${comaSeparatedTableNames}`
    console.log('Executing query: ',dropQuery)
    await pool.query(dropQuery)
}

async function query(text, params) {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
}

async function getClient() {
    const client = await pool.connect()
    const query = client.query
    const release = client.release
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
    console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
    client.lastQuery = args
    return query.apply(client, args)
    }
    client.release = () => {
    // clear our timeout
    clearTimeout(timeout)
    // set the methods back to their old un-monkey-patched version
    client.query = query
    client.release = release
    return release.apply(client)
    }
    return client
}

module.exports = {
    tables,
    getClient,
    query,
    dropTables,
    closePool
}

  