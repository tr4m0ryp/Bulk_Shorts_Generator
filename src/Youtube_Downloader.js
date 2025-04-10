const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');

const downloadDir = 'gedownloade vids';
const link_download = "https://www.youtube.com/watch?v=2ANwf9FJO3I";

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const writeFileAsync = promisify(fs.writeFile);

const header_key = {
  'authority': 'api.mp3youtube.cc',
  'accept': '*/*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'nl-NL,nl;q=0.5',
  'content-type': 'application/json',
  'origin': 'https://iframe.y2meta-uk.com',
  'referer': 'https://iframe.y2meta-uk.com/',
  'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
};

const requestData = {
  link: link_download,
  format: "mp4",
  audioBitrate: 128,
  videoQuality: 720,
  filenameStyle: "pretty",
  vCodec: "h264"
};

async function downloadFile(url, filename) {
  console.log(`Download gestart: ${filename}`);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const filePath = path.join(downloadDir, filename);
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`Download voltooid: ${filename}`);
      resolve(filePath);
    });
    writer.on('error', reject);
  });
}

async function downloadVideo() {
  try {
    console.log("API key aanvragen...");
    const keyResponse = await fetch("https://api.mp3youtube.cc/v2/sanity/key", {
      method: 'GET',
      headers: header_key
    });
    
    if (!keyResponse.ok) {
      throw new Error(`Key request mislukt: ${keyResponse.status}`);
    }
    
    const keyData = await keyResponse.json();
    const apiKey = keyData.key;
    console.log("API key ontvangen");

    const downloadHeaders = {
      ...header_key,
      'content-type': 'application/x-www-form-urlencoded',
      'key': apiKey
    };

    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(requestData)) {
      formData.append(key, value);
    }

    console.log("Download verzoek versturen...");
    const response = await fetch("https://api.mp3youtube.cc/v2/converter", {
      method: "POST",
      headers: downloadHeaders,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Download verzoek mislukt: ${response.status}`);
    }

    console.log("Wachten op verwerking...");
    await delay(3000);

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`API Fout: ${result.error}`);
    }

    console.log("Download URL ontvangen, fetching files...");
    const filePath = await downloadFile(result.url, result.filename);
    
    return {
      status: 'success',
      filePath: filePath,
      filename: result.filename
    };

  } catch (error) {
    console.error("Error for download:", error.message);
    throw error;
  }
}


(async () => {
  try {
    console.log("Download proces starten...");
    const result = await downloadVideo();
    console.log(`\n Download succesvol opgeslagen in: ${result.filePath}`);
    
  } catch (error) {
    console.error("\n Download failed:", error.message);
    process.exit(1);
  }
})();