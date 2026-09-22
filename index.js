const fs = require("fs");
const path = require("path");

const songDir = path.join(__dirname, "songs");

const songs = fs.readdirSync(songDir);

console.log("===== Terminal Music Player =====\n");

songs.forEach((song, index) => {
    console.log(`${index + 1}. ${song}`);
});