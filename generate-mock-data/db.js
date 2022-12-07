const { Pool } = require('pg');

const env = process.env;

const pool = new Pool({
	user: env.PGUSER,
	host: env.PGHOST,
	database: env.PGDATABASE,
	password: env.PGPASSWORD,
	port: env.PGPORT,
});
console.log('Pool created!');

// Another comment test rebase
const tables = {
	EMPLOYEE: {
		rows: 100,
		name: 'employee',
		fields: {
			ID: 'id',
			NAME: 'name',
			EMAIL: 'email',
			PARENT_ID: 'parent_id',
		},
	},
	CLIENT: {
		rows: 100,
		name: 'client',
		fields: {
			ID: 'id',
			NAME: 'name',
			EMAIL: 'email',
		},
	},
};

function addComaSeparatedProps(tables) {
	tables.comaSeparated = Object.keys(tables)
		.map((key) => tables[key].name)
		.join(', ');
	// Object.keys(tables)
	// 	.map((key) => {
	// 		if (key.toUpperCase(key) === key) {
	// 			const fields = tables[key].fields;
	// 			delete fields.ID;
	// 			return fields;
	// 		}
	// 	})
	// 	.map((fields) => {
	// 		if (fields != null) {
	// 			console.log('!!!', fields);
	// 			return Object.keys(fields)
	// 				.map((key) => fields[key])
	// 				.join(', ');
	// 		}
	// 	})
	// 	.forEach((comaSeparatedFields) => {
	// 		if (comaSeparatedFields != null) {
	// 			Object.keys(tables).forEach((key) => {
	// 				if (key.toUpperCase(key) === key) {
	// 					tables[key].fields.comaSeparated = comaSeparatedFields;
	// 				}
	// 			});
	// 		}
	// 	});
}
addComaSeparatedProps(tables);

async function closePool() {
	await pool.end();
}

async function dropTables() {
	const dropQuery = `DROP TABLE ${tables.comaSeparated}`;
	console.log('Executing query: ', dropQuery);
	await pool.query(dropQuery);
}

async function query(text, params) {
	const start = Date.now();
	const res = await pool.query(text, params);
	const duration = Date.now() - start;
	console.log('executed query', { text, duration, rows: res.rowCount });
	return res;
}

async function getClient() {
	const client = await pool.connect();
	const query = client.query;
	const release = client.release;
	// set a timeout of 5 seconds, after which we will log this client's last query
	const timeout = setTimeout(() => {
		console.error('A client has been checked out for more than 5 seconds!');
		console.error(
			`The last executed query on this client was: ${client.lastQuery}`
		);
	}, 5000);
	// monkey patch the query method to keep track of the last query executed
	client.query = (...args) => {
		console.log(...args);
		client.lastQuery = args;
		return query.apply(client, args);
	};
	client.release = () => {
		// clear our timeout
		clearTimeout(timeout);
		// set the methods back to their old un-monkey-patched version
		client.query = query;
		client.release = release;
		return release.apply(client);
	};
	return client;
}

module.exports = {
	tables,
	getClient,
	query,
	dropTables,
	closePool,
};
