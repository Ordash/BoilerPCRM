const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const getAllNames = async () => {
	const baseUrl = 'https://namecensus.com/last-names/';
	let url = baseUrl;
	const names = [];
	for (let i = 0; i < 5; i++) {
		await addNamesFromHtml(url, names);
		url = `${baseUrl}?start=${i + 1}000`;
	}
	const onlyFirstCapital = names.map((el) => {
		return `${el.substring(0, 1)}${el.substring(1).toLowerCase()}`;
	});
	const data = JSON.stringify(onlyFirstCapital);
	fs.writeFileSync('last-names.json', data);
};

const addNamesFromHtml = async (url, allNames) => {
	const options = {
		uri: url,
		transform: function (body) {
			return cheerio.load(body);
		},
	};
	try {
		const $ = await request(options);
		$('td > a').each((i, obj) => {
			allNames.push(obj.firstChild.data);
		});
	} catch (err) {
		log.error(err);
	}
};

getAllNames();
