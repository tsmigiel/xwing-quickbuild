#!/bin/bash
dirs=(
  "../typescript/dist/data"
  "typescript/dist/data"
  "dist/data"
)
data_dir="."
for d in "${dirs[@]}" ; do
	if [ -d "$d" ] ; then
		data_dir="$d"
	fi
done

echo "Fetching json and storing to $data_dir"

curl https://squadbuilder.fantasyflightgames.com/api/cards/pilots/ | node sortcards.js | json_reformat > "$data_dir/pilots.json"
curl https://squadbuilder.fantasyflightgames.com/api/cards/upgrades/ | node sortcards.js | json_reformat > "$data_dir/upgrades.json"
curl https://squadbuilder.fantasyflightgames.com/api/app-metadata/ | node sortappmetadata.js | json_reformat > "$data_dir/app-metadata.json"
curl https://squadbuilder.fantasyflightgames.com/api/cards/extensions/ | json_reformat > "$data_dir/cards_extensions.json"
curl https://squadbuilder.fantasyflightgames.com/api/gameformats/ | node sortgameformats.js | json_reformat > "$data_dir/gameformats.json"
curl https://squadbuilder.fantasyflightgames.com/api/gamemodes/ | json_reformat > "$data_dir/gamemode.json"
