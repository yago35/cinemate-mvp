const cheerio = require('cheerio');
const html = `<item><letterboxd:filmTitle>The Straight Story</letterboxd:filmTitle></item>`;
const $ = cheerio.load(html, {xmlMode: true});
console.log("find:", $('item').find('letterboxd\\:filmTitle').text());
console.log("name:", $('item').children().first()[0].name);
