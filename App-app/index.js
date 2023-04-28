var express = require('express');
var fs = require('fs');

var app = express();
app.use(express.static('src'));
app.use(express.static('../App-contract/build/contracts'));
app.get('/', function (req, res) {
  res.render('index.html');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

