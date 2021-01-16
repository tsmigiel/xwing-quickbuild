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

echo "Resorting json in $data_dir"

cp "$data_dir/pilots.json" "$data_dir/b_pilots.json"
cat "$data_dir/b_pilots.json" | node sortcards.js | json_reformat > "$data_dir/pilots.json"
cp "$data_dir/upgrades.json" "$data_dir/b_upgrades.json"
cat "$data_dir/b_upgrades.json" | node sortcards.js | json_reformat > "$data_dir/upgrades.json"
cp "$data_dir/app-metadata.json" "$data_dir/b_app-metadata.json"
cat "$data_dir/b_app-metadata.json" | node sortappmetadata.js | json_reformat > "$data_dir/app-metadata.json"
cp "$data_dir/cards_extensions.json" "$data_dir/b_cards_extensions.json"
cat "$data_dir/b_cards_extensions.json" | node sortextensions.js |json_reformat > "$data_dir/cards_extensions.json"
cp "$data_dir/gameformats.json" "$data_dir/b_gameformats.json"
cat "$data_dir/b_gameformats.json" | node sortgameformats.js | json_reformat > "$data_dir/gameformats.json"
cp "$data_dir/gamemode.json" "$data_dir/b_gamemode.json"
cat "$data_dir/b_gamemode.json" | json_reformat > "$data_dir/gamemode.json"
