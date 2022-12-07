const { getClient, tables, closePool } = require('./db');
const { getRandomFullName } = require('./generate-data');

// Hello comment
async function createEmployeeTable(client) {
	const query = `CREATE TABLE ${tables.EMPLOYEE.name} (
        ${tables.EMPLOYEE.fields.ID} SERIAL PRIMARY KEY,
        ${tables.EMPLOYEE.fields.NAME} VARCHAR(50) NOT NULL,
        ${tables.EMPLOYEE.fields.EMAIL} VARCHAR(255) NOT NULL UNIQUE,
		${tables.EMPLOYEE.fields.PARENT_ID} BIGINT NOT NULL,
		FOREIGN KEY (${tables.EMPLOYEE.fields.PARENT_ID}) 
		REFERENCES ${tables.EMPLOYEE.name}(${tables.EMPLOYEE.fields.ID})
    )`;
	await client.query(query);
}

// One more  comment
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
	let parent = 1;
	for (let i = 0; i < tables.EMPLOYEE.rows; i++) {
		const name = getRandomFullName();
		const email = `${name.toLowerCase().replace(' ', '.')}@company.com`;
		values.push(`('${name}', '${email}', ${parent})`);
		if (i >= 6 && i < 15 && i % 3 === 0) {
			parent++;
		}
		if (i >= 15 && i < 30 && i % 5 === 0) {
			parent++;
		}
		if (i >= 30 && i % 10 === 0) {
			parent++;
		}
	}
	return values.join(', ');
}

async function populateEmployee(client) {
	const query = `INSERT INTO ${tables.EMPLOYEE.name} 
	(${tables.EMPLOYEE.fields.NAME}, 
		${tables.EMPLOYEE.fields.EMAIL},
		${tables.EMPLOYEE.fields.PARENT_ID})
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
