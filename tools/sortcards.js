
var fs = require('fs');
var data = fs.readFileSync(0, 'utf-8');
var json = JSON.parse(data)
json.cards.sort((a, b) => parseInt(a.id) - parseInt(b.id))
process.stdout.write(JSON.stringify(json))

