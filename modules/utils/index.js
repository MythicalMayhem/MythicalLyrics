const checkOptions = (options) => {
	let { apiKey, title, artist } = options;
	if (!apiKey) {
		throw '"apiKey" property is missing from options';
	} else if (!title) {
		throw '"title" property is missing from options';
	}
};
const getTitle = (title, artist) => {
	let b = `${artist} ${title}`
		.toLowerCase()

		.replace(/[ ](ft|feat)\.?[ ].*/g, '').replace(/\([^)]*\)/g, '')
		.replace(/ *\[[^\]]*]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
	console.log(b)
	if (b.length > 12) {
		const lastIndex = b.lastIndexOf('-');
		b = b.slice(0, lastIndex)
	}
	return b
};

module.exports = { checkOptions, getTitle };
