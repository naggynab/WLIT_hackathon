import "dotenv/config.js";
// Leave empty for same-origin mode when the backend serves the frontend.
// For a separately deployed frontend, set this to the public backend URL.
window.AAMA_API_URL = '';

// Use a browser-restricted Google Maps Platform key. Enable Maps JavaScript API
// and Places API (New) for the same Google Cloud project. For local development
// you can also set GOOGLE_MAPS_API_KEY in the project .env file.
// window.MATRI_SATHI_GOOGLE_MAPS_API_KEY = 'AIzaSyASmZ-Si42MWqt_uyRF1xka91LUf5V7NKQ';
window.MATRI_SATHI_GOOGLE_MAPS_API_KEY = dotenv.GOOGLE_MAPS_API_KEY || '';

// Google Maps Demo Keys are free for educational prototypes and support live
// maps and Place data, but Google does not make Place Photos or reviews
// available to them. Set this to true only when using a billing-enabled key.
window.MATRI_SATHI_GOOGLE_MAPS_INCLUDE_PHOTOS = false;

// Movement videos: paste a YouTube link between each pair of quotes.
// Supports youtube.com/watch?v=..., youtu.be/..., and YouTube Shorts links.
// Leave a link empty to show the video placeholder.
window.AAMA_MOVEMENT_VIDEOS = {
  walking: 'https://www.youtube.com/watch?v=enYITYwvPAQ',
  pelvic: 'https://www.youtube.com/watch?v=G5PL7NZbGk0&t=45s',
  mobility: 'https://www.youtube.com/watch?v=WUKHM6-ekJM',
};
