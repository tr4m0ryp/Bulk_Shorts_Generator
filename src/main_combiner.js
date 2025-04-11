const { main_vidgen } = require('./main_vidgen');

const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

function getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        if (!metadata || !metadata.format) {
        return reject(new Error('Geen geldige metadata gevonden'));
        }
        resolve(metadata.format.duration);
        });
    });
}

function cutClip(inputPath, outputPath, startTime, duration) {
    return new Promise((resolve, reject) => {
    ffmpeg()
        .input(inputPath)
        .setStartTime(startTime)
        .duration(duration)
        .output(outputPath)
        .on('start', (cmd) => console.log('FFmpeg cut gestart:\n', cmd))
        .on('end', () => {
            console.log('FFmpeg cut klaar:', outputPath);
            resolve(outputPath);
        })
        .on('error', (err) => reject(err))
        .run();
    });
}

function combineTwoClips(input1, input2, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg()
        .input(input1)
        .input(input2)
        .complexFilter([
            '[0:v]scale=1920:1080[v0]',
            '[1:v]scale=1920:1080[v1]',
            '[v0][v1]vstack=inputs=2[stacked]',
            '[stacked]crop=1080:1920:420:0[cropped]',
        ], 'cropped')
        .outputOptions([
            '-c:v libx264',
            '-crf 23',
            '-preset veryfast',
        ])
        .outputFormat('mp4')
        .on('start', (cmd) => console.log('FFmpeg combine gestart:\n', cmd))
        .on('progress', progress => console.log('Progress:', progress))
        .on('end', () => {
            console.log('FFmpeg combine klaar:', outputPath);
            resolve(outputPath);
        })
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
}

async function combineWithRandomClips(clipsArray) {
    const secondVideoPath = 'C:\Users\Moussa\Downloads\Youtube_vid-main\Youtube_vid-main\src\DopamineVid\video.mp4'; //#############################################path van de minecraft video van 10 uur
    if (!fs.existsSync(secondVideoPath)) {
        throw new Error(`Video niet gevonden op pad: ${secondVideoPath}`);
    }

    const secondVideoDuration = await getVideoDuration(secondVideoPath);
    const combinedResults = [];

    for (let i = 0; i < clipsArray.length; i++) {
        const clipPath = clipsArray[i];

        const clipDuration = await getVideoDuration(clipPath);
    if (clipDuration > secondVideoDuration) {
        console.warn(`Clip is langer (${clipDuration}s) dan ${secondVideoDuration}s, overslaan...`);
        continue;
        }

    const maxStart = secondVideoDuration - clipDuration;
    const randomStart = Math.random() * maxStart;

            // Knip het fragment uit video2
    const randomClipPath = path.join(__dirname, `random_clip_${i}_${Date.now()}.mp4`);
    await cutClip(secondVideoPath, randomClipPath, randomStart, clipDuration);

            // Combineer de originele clip met het random fragment
        const combinedOutput = path.join(__dirname, `combined_${i}_${Date.now()}.mp4`);
    await combineTwoClips(clipPath, randomClipPath, combinedOutput);

            // Verwijder de tijdelijke random clip
    fs.unlink(randomClipPath, (err) => {
        if (err) console.error(`Fout bij verwijderen van ${randomClipPath}:`, err);
        else console.log(`Tijdelijk bestand ${randomClipPath} verwijderd.`);
        });

            // Verwijder de originele clip (als deze niet langer nodig is)
    fs.unlink(clipPath, (err) => {
        if (err) console.error(`Fout bij verwijderen van ${clipPath}:`, err);
        else console.log(`Originele clip ${clipPath} verwijderd.`);
        });

    combinedResults.push(combinedOutput);
    }

    return combinedResults;
}


async function main(url_short) {
        const result = await main_vidgen(url_short); 
        console.log('Gekregen van main_vidgen:', result);

        // result.clips is een array met paden naar de clips die we gaan verwerken
        const combinedClips = await combineWithRandomClips(result.clips);
        console.log('Alle gecombineerde clips:', combinedClips);

        // Optioneel: als je het oorspronkelijke gedownloade bestand (result.filePath) ook niet meer nodig hebt,
        // verwijder dat dan ook:
        fs.unlink(result.filePath, (err) => {
            if (err) console.error(`Fout bij verwijderen van hoofdvideo ${result.filePath}:`, err);
            else console.log(`Hoofdvideo ${result.filePath} verwijderd.`);
    });
}

main('7ZG4OgcIDWo'); 
