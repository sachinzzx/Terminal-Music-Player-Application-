const fs = require("fs");
const path = require("path");

const songDir = path.join(__dirname, "songs");

let songs = fs.readdirSync(songDir);
let cursor = 0;

function displaySongs() {
    console.clear();

    console.log("===== Terminal Music Player =====\n");

    songs.forEach((song, index) => {
        const pointer = index === cursor ? ">" : " ";
        console.log(`${pointer} ${song}`);
    });

    console.log("\n↑ ↓ : Navigate");
    console.log("Enter : Select");
    console.log("Ctrl + C : Exit");
}

displaySongs();

process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("data", (data) => {

    // Up arrow
    if (
        data[0] === 27 &&
        data[1] === 91 &&
        data[2] === 65
    ) {
        cursor--;

        if (cursor < 0) {
            cursor = songs.length - 1;
        }

        displaySongs();
    }

    // Down arrow
    else if (
        data[0] === 27 &&
        data[1] === 91 &&
        data[2] === 66
    ) {
        cursor++;

        if (cursor >= songs.length) {
            cursor = 0;
        }

        displaySongs();
    }

    // Enter
    else if (data[0] === 13) {
        console.log(`\nSelected: ${songs[cursor]}`);
    }

    // Ctrl + C
    else if (data[0] === 3) {
        process.exit();
    }
});