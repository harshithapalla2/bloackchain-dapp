var express = require('express');
var fs = require('fs');
const multer  = require('multer');
const path = require('path');



var app = express();
app.use(express.static('src'));
app.use(express.static('../App-contract/build/contracts'));
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'src/images/' });




app.get('/', function (req, res) {
  res.render('index.html');
});

// app.post('/addItem/', function(req, res) {
//   const newItem = req.body; // assume the request body is a JSON object representing the new item
//   const items = JSON.parse(fs.readFileSync('src/items.json', 'utf8'));
//   items.push(newItem);
//   fs.writeFileSync('src/items.json', JSON.stringify(items), 'utf8');
//   res.send('Item added successfully');
// });

app.post('/upload', upload.single('myFile'), (req, res) => {
  const file = req.file;
  const account = req.body.account;  
  console.log(account);
  console.log(file); // should output the file metadata
  // const upload = multer({ dest: `uploads/${account}` });

  // const newStr = req.body.name.replace(/\s+/g, '_')+path.extname(file.originalname).toLowerCase();
  const newStr = req.body.name.replace(/\s+/g, '_')+'.jpeg';


  console.log(newStr);

  const filePath = `src/images/${newStr}`;

  // console.log(req.body)

  const newItem={
    "name": req.body.name,    
    "description": req.body.description,    
    "price": req.body.price,
    "imgLoc":filePath
  };
  const items = JSON.parse(fs.readFileSync('src/items.json', 'utf8'));
  items.push(newItem);
  fs.writeFileSync('src/items.json', JSON.stringify(items), 'utf8');


  fs.rename(file.path, filePath, err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading file');
    }
    res.send('File uploaded successfully');
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});




