const { getClient, tables, closePool } = require('./db');
const { getRandomFullName } = require('./generate-data');

async function createEmployeeTable(client) {
	const query = `CREATE TABLE ${tables.EMPLOYEE.name} (
        ${tables.EMPLOYEE.fields.ID} SERIAL PRIMARY KEY,
        ${tables.EMPLOYEE.fields.NAME} VARCHAR(50) NOT NULL,
        ${tables.EMPLOYEE.fields.EMAIL} VARCHAR(255) NOT NULL UNIQUE
    )`;
	await client.query(query);
}

async function createClientTable(client) {
	const query = `CREATE TABLE ${tables.CLIENT.name} (
        ${tables.CLIENT.fields.ID} SERIAL PRIMARY KEY,
        ${tables.CLIENT.fields.NAME} VARCHAR(255) NOT NULL UNIQUE,
        ${tables.CLIENT.fields.EMAIL} VARCHAR(255) NOT NULL UNIQUE
    )`;
	await client.query(query);
}

async function createTables(client) {
	createEmployeeTable(client);
	createClientTable(client);
}

function generateEmployeeValues() {
	const values = [];
	for (let i = 0; i < tables.EMPLOYEE.rows; i++) {
		const name = getRandomFullName();
		const email = `${name.toLowerCase().replace(' ', '.')}@company.com`;
		values.push(`('${name}', '${email}')`);
	}
	return values.join(', ');
}

async function populateEmployee(client) {
	const query = `INSERT INTO ${tables.EMPLOYEE.name} (${
		tables.EMPLOYEE.fields.NAME
	}, ${tables.EMPLOYEE.fields.EMAIL})
    VALUES ${generateEmployeeValues()}`;
	await client.query(query);
}

async function populateTables(client) {
	populateEmployee(client);
}

async function startTransaction() {
	const client = await getClient();
	try {
		const start = Date.now();
		await client.query('BEGIN');
		createTables(client);
		populateTables(client);
		await client.query('COMMIT');
		const duration = Date.now() - start;
		console.log(`Completed in ${duration}ms`);
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

startTransaction();

closePool();
