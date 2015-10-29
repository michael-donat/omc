var express = require('express');
var app = express();

app.use(express.static('dev'));

var Roster = require('./model/roster')
var roster = new Roster(require('./data/members.json'))

app.get('/api/1.0/roster', function(req, res) {
  res.json(roster.all())
})

var server = app.listen(process.env.PORT || 3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  roster.start()

  console.log('Listening at http://%s:%s', host, port);
  console.log('Roster polling started.')
});
