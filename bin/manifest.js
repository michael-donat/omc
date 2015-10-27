var rp = require('request-promise')
var fs = require('fs')
var unzip = require('unzip')

var url = 'http://www.bungie.net/platform/Destiny/Manifest/'
var url = 'http://www.bungie.net/common/destiny_content/sqlite/en/world_sql_content_a27a2e756050352e5ceb16d7ffffd41d.content'

var options = {
    uri: url
};

rp(options).pipe(unzip.Parse()).on('entry', function (entry) {
    entry.pipe(fs.createWriteStream('./cache/sql'));
}).on('close', function() {

  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database('./cache/sql', sqlite3.OPEN_READONLY);

  db.all("SELECT name FROM sqlite_master WHERE type = 'table';", function(err, result) {
    if (err) {
      console.err(err); process.exit(1)
    }

    result.forEach(function(table) {

      db.all("SELECT * FROM " + table.name, function(err, result) {
        if (err) {
          console.err(err); process.exit(1)
        }
        var json = []
        result.forEach(function(item) {
          json.push(JSON.parse(item.json))
        })
        fs.writeFileSync('./cache/'+table.name+'.json', JSON.stringify(json))
      })
    })
  })
});
