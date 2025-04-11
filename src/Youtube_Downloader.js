const fs = require('fs');
const path = require('path');
const axios = require('axios');
const downloadDir = 'gedownloade_vids';
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
const delay = ms => new Promise(res => setTimeout(res, ms));

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


async function getVideoTitle(videoId) {
  const res = await axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
  const rawTitle = res.data.title;

  return rawTitle
    .replace(/[<>:"/\\|?*]+/g, '') 
    .replace(/\s+/g, '_')          
    .trim();
}


async function downloadFile(url, filename) {
  const response = await axios({ method: 'GET', url, responseType: 'stream' });
  const filePath = path.join(downloadDir, filename);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}


async function downloadVideo(videoId) {
  const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

  const requestData = {
    link: videoLink,
    format: "mp4",
    audioBitrate: 128,
    videoQuality: 720,
    filenameStyle: "pretty",
    vCodec: "h264"
  };

  const keyRes = await fetch("https://api.mp3youtube.cc/v2/sanity/key", { headers: header_key });
  const { key } = await keyRes.json();

  const downloadHeaders = {
    ...header_key,
    'content-type': 'application/x-www-form-urlencoded',
    key
  };

  const formData = new URLSearchParams(Object.entries(requestData));
  const res = await fetch("https://api.mp3youtube.cc/v2/converter", {
    method: "POST",
    headers: downloadHeaders,
    body: formData
  });

  await delay(3000);
  const result = await res.json();

  const cleanTitle = await getVideoTitle(videoId);
  const finalFilename = `${cleanTitle}.mp4`;

  const filePath = await downloadFile(result.url, finalFilename);

  return { status: 'success', filePath, filename: finalFilename };
}

module.exports = {
  downloadVideo
};
