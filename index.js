const express = require('express')
const multer = require('multer') 
const fs = require('fs');
const https = require('https');
const vid = "myvideo.mp4";

const app = express()

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, vid);
  }
})
const upload = multer({ storage: storage })

// Root Page
app.get('/', (req, res)=>{
  res.sendFile(__dirname + "/index.html");
})

// Stream Video
app.get('/stream', (req, res)=>{
  res.sendFile(__dirname + '/stream.html');
})
// Upload Video
app.post('/upload-video', upload.single('my-video'), (req, res) => {
	console.log(`Video uploaded: ${req.file.filename}`)
})

// Stream Video
app.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "./uploads/myvideo.mp4";
  const videoSize = fs.statSync("./uploads/myvideo.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
}); 

// download video
app.post('/download', (req, res)=>{ 
  const url = '/uploads/myvideo.mp4'; 
https.get(url,(res) => {
    // Image will be stored at this path
    const path = `${__dirname}/files/downloaded.mp4`; 
    const filePath = fs.createWriteStream(path);
    res.pipe(filePath);
    filePath.on('finish',() => {
        filePath.close();
        console.log('Download Completed'); 
    })
}) 
})
 
const PORT = 3000
app.listen(PORT, console.log(`Yay, Server is running on port: ${PORT}`))