var express = require('express');
var app = express();
var cors = require('cors');

app.use(express.static('dev'));

var Roster = require('./model/roster')
var roster = new Roster(require('./data/members.json'))

app.get('/api/1.0/roster', cors({
  origin: ['http://github.io', 'http://127.0.0.1:3001']
}), function(req, res) {
  res.json(roster.all())
})

var server = app.listen(process.env.PORT || 3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  roster.start()

  console.log('Listening at http://%s:%s', host, port);
  console.log('Roster polling started.')
});
