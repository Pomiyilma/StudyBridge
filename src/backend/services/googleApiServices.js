// src/services/googleApiServices.js
const {google} = require ('googleapiservices');

async function searchYoutube(query) {
    const youtube = google.youtube ({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
    const rest = await youtube.search.list({
        part: 'snippet',
        q: `${query} Ethiopian high school`,
        maxResults: 5,
        type: 'video'
    });
    return rest.data.items.map(item => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
}