const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const VIDEO_DIR = path.join(__dirname, 'videos');

app.use(cors());
app.use(express.json());

// Create directories if they don't exist
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR);

// ✅ Robust sanitization function
function sanitizeFilename(name) {
  return name
    .replace(/[\/\\?%*:|"<>#&]/g, '-')  // Replace unsafe characters
    .replace(/[^\x00-\x7F]/g, '')       // Remove emojis/specials
    .replace(/\s+/g, ' ')               // Collapse multiple spaces
    .trim();
}

// 🎵 Download MP3
app.post('/api/download', (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: 'Missing URL' });

  const metadataCommand = `yt-dlp --print-json "${videoUrl}"`;

  exec(metadataCommand, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Metadata fetch failed' });

    let metadata;
    try {
      metadata = JSON.parse(stdout);
    } catch (e) {
      return res.status(500).json({ error: 'Metadata parse error' });
    }

    const safeTitle = sanitizeFilename(metadata.title);
    const finalFilename = `${safeTitle}.mp3`;
    const outputTemplate = path.join(DOWNLOAD_DIR, `${safeTitle}.%(ext)s`);

    const downloadCommand = `yt-dlp -x --audio-format mp3 --ffmpeg-location "C:/Users/ASUS/Downloads/ffmpeg-7.1.1-full_build/ffmpeg-7.1.1-full_build/bin/ffmpeg.exe" -o "${outputTemplate}" "${videoUrl}"`;

    exec(downloadCommand, (downloadErr) => {
      if (downloadErr) return res.status(500).json({ error: 'Download failed' });

      const finalPath = path.join(DOWNLOAD_DIR, finalFilename);

      // Confirm file saved
      setTimeout(() => {
        if (!fs.existsSync(finalPath)) {
          return res.status(500).json({ error: 'MP3 file not created' });
        }

        res.json({
          filename: finalFilename,  // ✅ Use exact saved name
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          uploader: metadata.uploader,
          duration: metadata.duration
        });
      }, 1000);
    });
  });
});

// 📽 Download MP4 Video
app.post('/api/download-video', (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: 'Missing URL' });

  const metadataCommand = `yt-dlp --print-json "${videoUrl}"`;

  exec(metadataCommand, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Metadata fetch failed' });

    let metadata;
    try {
      metadata = JSON.parse(stdout);
    } catch (e) {
      return res.status(500).json({ error: 'Metadata parse error' });
    }

    const safeTitle = sanitizeFilename(metadata.title);
    const filename = `${safeTitle}.mp4`;
    const outputTemplate = path.join(VIDEO_DIR, `${safeTitle}.%(ext)s`);
    const videoPath = path.join(VIDEO_DIR, filename);

    const downloadCommand = `yt-dlp -f mp4 -o "${outputTemplate}" "${videoUrl}"`;

    exec(downloadCommand, (downloadErr) => {
      if (downloadErr) return res.status(500).json({ error: 'Video download failed' });

      // Wait for the file to appear
      setTimeout(() => {
        if (!fs.existsSync(videoPath)) {
          return res.status(500).json({ error: 'Video file not created' });
        }

        res.json({
          filename,
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          uploader: metadata.uploader,
          duration: metadata.duration
        });
      }, 1000); // Wait 1 second to ensure file is written
    });
  });
});


// 🟢 Serve MP3 file
app.get('/api/file', (req, res) => {
  let filename = req.query.filename;

  // decodeURIComponent handles any %20 or %23 from frontend
  filename = decodeURIComponent(filename);

  // Ensure .mp3 extension
  if (!filename.endsWith('.mp3')) {
    filename += '.mp3';
  }

  const filePath = path.join(DOWNLOAD_DIR, filename);

  console.log('Looking for file:', filename);
  console.log('Full path:', filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath);
});

// 🟢 Serve MP4 file
app.get('/api/video', (req, res) => {
  let filename = decodeURIComponent(req.query.filename);

  if (!filename.endsWith('.mp4')) {
    filename += '.mp4';
  }

  const filePath = path.join(VIDEO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

