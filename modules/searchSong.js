const axios = require('axios');
const { checkOptions, getTitle } = require('./utils');

const searchUrl = 'https://api.genius.com/search?q=';

/**
 * @param {{apiKey: string, title: string, artist: string, optimizeQuery: boolean, authHeader: boolean}} options
 */
module.exports = async function (options) {
	try {

		checkOptions(options);
		let { apiKey, title, artist, optimizeQuery = false, authHeader = false } = options;
		const song = optimizeQuery ? getTitle(title, artist) : `${title} ${artist}`;

		const reqUrl = `${searchUrl}${encodeURIComponent(song)}`;
		const headers = {
			Authorization: 'Bearer ' + apiKey
		};
		let { data } = await axios.get(
			authHeader ? reqUrl : `${reqUrl}&access_token=${apiKey}`,
			authHeader && { headers }
		);
		if (data.response.hits.length === 0) return {};
		const results = data.response.hits.map((val) => {
			const { full_title, title, song_art_image_url, artist_names, id, url } = val.result;
			return { id, title: title, artists: artist_names, albumArt: song_art_image_url, url };
		});
		return results;
	} catch (e) {
		throw e;
	}
};
