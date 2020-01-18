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

curl https://squadbuilder.fantasyflightgames.com/api/cards/ | json_reformat > "$data_dir/cards.json"
curl https://squadbuilder.fantasyflightgames.com/api/app-metadata/ | json_reformat > "$data_dir/app-metadata.json"
curl https://squadbuilder.fantasyflightgames.com/api/cards/extensions/ | json_reformat > "$data_dir/cards_extensions.json"
curl https://squadbuilder.fantasyflightgames.com/api/gameformats/ | json_reformat > "$data_dir/gameformats.json"
curl https://squadbuilder.fantasyflightgames.com/api/gamemodes/ | json_reformat > "$data_dir/gamemode.json"
