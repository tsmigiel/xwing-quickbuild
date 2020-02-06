
var fs = require('fs');
var data = fs.readFileSync(0, 'utf-8');
var json = JSON.parse(data)
json.game_formats.sort((a, b) => a.id.localeCompare(b.id))
process.stdout.write(JSON.stringify(json))

