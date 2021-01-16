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

curl https://x-wing-api.fantasyflightgames.com/cards/pilots/ | node sortcards.js | json_reformat > "$data_dir/pilots.json"
curl https://x-wing-api.fantasyflightgames.com/cards/upgrades/ | node sortcards.js | json_reformat > "$data_dir/upgrades.json"
curl https://x-wing-api.fantasyflightgames.com/app-metadata/ | node sortappmetadata.js | json_reformat > "$data_dir/app-metadata.json"
curl https://x-wing-api.fantasyflightgames.com/cards/extensions/ | node sortextensions.js | json_reformat > "$data_dir/cards_extensions.json"
curl https://x-wing-api.fantasyflightgames.com/gameformats/ | node sortgameformats.js | json_reformat > "$data_dir/gameformats.json"
curl https://x-wing-api.fantasyflightgames.com/gamemodes/ | json_reformat > "$data_dir/gamemode.json"
