// main_vidgen.js
const { getMostReplayedParts } = require("./index.js");
const { downloadVideo } = require("./Youtube_Downloader.js");
const { exec } = require("child_process");

async function main_vidgen(link) {
    let downloadedFilePath;
    const clipNames = []; 

    try {
        const result = await downloadVideo(link);
        downloadedFilePath = result.filePath;
        console.log(result.filePath);
    } catch (err) {
        console.error("Fout bij downloaden:", err.message);
        throw err;
    }


    try {
        const data = await getMostReplayedParts(link, 9);
        await Promise.all(data.replayedParts.map((part, index) => {
        return new Promise((resolve, reject) => {
            const Start = part.start;
            const End = part.end;
            console.log(`Segment ${index}: ${Start} tot ${End}`);

            const duration = End - Start;
            const clipNum = String(index + 1).padStart(2, "0"); 
            const clipName = `clip_short_${clipNum}.mp4`;

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
    
    return {
        filePath: downloadedFilePath,
        clips: clipNames,
    };
    }

module.exports = {
  main_vidgen,
};
