const header_key = {
    'authority': 'api.mp3youtube.cc',
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'nl-NL,nl;q=0.5',
    'content-type': 'application/json',
    'if-none-match': 'W/"7e-Wcg8+ofDw4hO5KxfGMfxDk7H+OY-gzip"',
    'origin': 'https://iframe.y2meta-uk.com',
    'priority': 'u=1, i',
    'referer': 'https://iframe.y2meta-uk.com/',
    'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
};

async function key_gen() {
    try {
        const response = await fetch("https://api.mp3youtube.cc/v2/sanity/key", {
            method: 'GET', 
            headers: header_key
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const keyData = await response.json();
        console.log("Key data:", keyData.key);
        return keyData;
    } catch (error) {
        console.error("Error generating key:", error);
        throw error;
    }
}

key_gen();

