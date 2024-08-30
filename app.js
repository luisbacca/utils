const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/preview/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return res.status(400).send('Invalid video ID');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

    try {
        const response = await axios.get(videoUrl);
        const $ = cheerio.load(response.data);
        const videoTitle = $('title').text() || 'YouTube Video';

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${videoTitle}</title>
            <meta property="og:title" content="${videoTitle}">
            <meta property="og:image" content="${thumbnailUrl}">
            <meta property="og:url" content="${videoUrl}">
            <meta property="og:type" content="video.other">
            <meta http-equiv="refresh" content="0;url=${videoUrl}">
        </head>
        <body>
            <p>Redirecting to YouTube...</p>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).send('Error generating preview');
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
