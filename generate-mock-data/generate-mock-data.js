const { getClient, tables, closePool } = require('./db')

const EXEC = 'Executing query: '

async function createTables() {
    const client = await getClient()
    try {
        await client.query('BEGIN')
        const createEmployee = `CREATE TABLE ${tables.EMPLOYEE.name} (
            ${tables.EMPLOYEE.fields.ID} SERIAL PRIMARY KEY,
            ${tables.EMPLOYEE.fields.NAME} VARCHAR(50) NOT NULL,
            ${tables.EMPLOYEE.fields.EMAIL} VARCHAR(255) NOT NULL UNIQUE
        )`;
        console.log(EXEC + createEmployee)
        await client.query(createEmployee)
        const createClient = `CREATE TABLE ${tables.CLIENT.name} (
            ${tables.CLIENT.fields.ID} SERIAL PRIMARY KEY,
            ${tables.CLIENT.fields.NAME} VARCHAR(255) NOT NULL UNIQUE,
            ${tables.CLIENT.fields.EMAIL} VARCHAR(255) NOT NULL UNIQUE
        )`
        console.log(EXEC + createClient)
        await client.query(createClient)
        await client.query('COMMIT')
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
}

createTables()

closePool()
