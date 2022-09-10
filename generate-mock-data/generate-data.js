const { uniqueNamesGenerator, names } = require('unique-names-generator');
const fs = require('fs');

const lastNamesData = fs.readFileSync('./last-names.json');
const lastNames = JSON.parse(lastNamesData);

const config = {
	dictionaries: [names, lastNames],
	length: 2,
	separator: ' ',
};

function getRandomFullName() {
	return uniqueNamesGenerator(config);
}

module.exports = {
	getRandomFullName,
};
