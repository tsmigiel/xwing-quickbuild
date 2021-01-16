
var fs = require('fs');
var data = fs.readFileSync(0, 'utf-8');
var json = JSON.parse(data)
json.extensions.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.extensions.forEach((e) => {
	delete e.card_list;
})
process.stdout.write(JSON.stringify(json))
