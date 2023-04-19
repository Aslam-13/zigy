const express = require('express')
const multer = require('multer')

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
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

app.get('/', (req, res)=>{
  res.sendFile(__dirname + "/index.html");
})

app.post('/upload-video', upload.single('my-video'), (req, res) => {
	console.log(`Video uploaded: ${req.file.filename}`)
})

 
const PORT = 3000
app.listen(PORT, console.log(`Yay, Server is running on port: ${PORT}`))