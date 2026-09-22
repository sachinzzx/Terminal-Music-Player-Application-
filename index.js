const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");

const songDir = path.join(__dirname, "songs");

let allSongs = [];
let cursor = 0;

let musicProcess = undefined;
let isPaused = false;

let totalDuration = 0;
let timeElapsed = 0;

let volume = 50;
let progressTimer = undefined;


// Get all songs from songs folder
function loadSongs() {
    allSongs = fs.readdirSync(songDir).filter((song) => {
        const ext = path.extname(song).toLowerCase();

        return (
            ext === ".mp3" ||
            ext === ".wav" ||
            ext === ".m4a" ||
            ext === ".aac" ||
            ext === ".flac"
        );
    });
}


// Get song duration using macOS afinfo
function getSongDuration(songFilePath) {
    return new Promise((resolve, reject) => {
        const afinfo = spawn("afinfo", [songFilePath]);

        let output = "";

        afinfo.stdout.on("data", (data) => {
            output += data.toString();
        });

        afinfo.on("close", () => {
            const match = output.match(
                /estimated duration:\s*([\d.]+)/
            );

            if (match) {
                resolve(parseFloat(match[1]));
            } else {
                reject(new Error("Duration not found"));
            }
        });

        afinfo.on("error", reject);
    });
}


// Convert seconds into MM:SS
function formatTime(seconds) {
    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secondsLeft).padStart(2, "0")}`;
}

// Create progress bar
function renderBar(percentage) {
    const width = 30;

    const played = Math.round(
        width * percentage / 100
    );

    return (
        "█".repeat(played) +
        "░".repeat(width - played)
    );
}


// Display player UI
function listSongs() {
    process.stdout.write("\x1B[2J");
    process.stdout.write("\x1B[H");

    console.log("========================================");
    console.log("        TERMINAL MUSIC PLAYER");
    console.log("========================================\n");

    allSongs.forEach((song, index) => {
        const pointer = index === cursor ? ">" : " ";
        console.log(`${pointer} ${song}`);
    });

    console.log("\n----------------------------------------");

    if (musicProcess) {
        console.log(`Playing: ${allSongs[cursor]}`);
    } else {
        console.log("Playing: Nothing");
    }

    const percentage =
        totalDuration > 0
            ? Math.min(
                100,
                (timeElapsed / totalDuration) * 100
            )
            : 0;

    console.log(
        `${formatTime(timeElapsed)} / ${formatTime(totalDuration)}`
    );

    console.log();
    console.log(renderBar(percentage));

    console.log(`\nVolume: ${volume}%`);

    console.log("\n----------------------------------------");
    console.log("↑ ↓  Navigate");
    console.log("Enter  Play");
    console.log("P      Play / Pause");
    console.log("N      Next");
    console.log("B      Previous");
    console.log("+ / -  Volume");
    console.log("Q      Quit");
}