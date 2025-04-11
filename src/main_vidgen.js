// main_vidgen.js
const { getMostReplayedParts } = require("./index.js");
const { downloadVideo } = require("./Youtube_Downloader.js");
const { exec } = require("child_process");

async function main_vidgen(link) {
    let downloadedFilePath;
    const clipNames = []; // Maak een array om clipnamen op te slaan

    // Download de video
    try {
        const result = await downloadVideo(link);
        downloadedFilePath = result.filePath;
        console.log(result.filePath);
    } catch (err) {
        console.error("Fout bij downloaden:", err.message);
        throw err;
    }

    // Haal de meest afgespeelde delen op en knip de clips
    try {
        const data = await getMostReplayedParts(link, 9);
        // Gebruik Promise.all of een for-loop zodat je kunt wachten tot elke exec klaar is
        await Promise.all(data.replayedParts.map((part, index) => {
        return new Promise((resolve, reject) => {
            const Start = part.start;
            const End = part.end;
            console.log(`Segment ${index}: ${Start} tot ${End}`);

            const duration = End - Start;
            const clipNum = String(index + 1).padStart(2, "0"); 
            const clipName = `clip_short_${clipNum}.mp4`;

            // Voeg het clipName toe aan de array
            clipNames.push(clipName);

            const command = `ffmpeg -i "${downloadedFilePath}" -ss ${Start} -t ${duration} -c copy "gedownloade_vids/${clipName}"`;
            exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Fout bij knippen van clip ${clipName}:`, error.message);
                return reject(error);
            } else {
                console.log(`Clip gemaakt: ${clipName}`);
                resolve();
            }
            });
        });
        }));
    } catch (error) {
        console.error("Fout bij verwerken van segmenten:", error);
        throw error;
    }
    
    // Retourneer het object met zowel filePath als de clips array
    return {
        filePath: downloadedFilePath,
        clips: clipNames,
    };
    }

module.exports = {
  main_vidgen,
};
