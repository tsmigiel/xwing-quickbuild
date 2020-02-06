
var fs = require('fs');
var data = fs.readFileSync(0, 'utf-8');
var json = JSON.parse(data)
json.supported_languages.sort((a, b) => a.name.localeCompare(b.name))
json.force_affiliation.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.ship_size.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.ship_types.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.card_stats.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.card_types.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.factions.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.card_action_types.sort((a, b) => parseInt(a.id) - parseInt(b.id))
json.upgrade_types.sort((a, b) => parseInt(a.id) - parseInt(b.id))
process.stdout.write(JSON.stringify(json))

