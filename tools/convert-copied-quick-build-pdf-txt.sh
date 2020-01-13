#!/bin/bash
#
# Given raw text that was from "Adobe Acrobat Reader DC" by "select all" ->
# "copy", convert it to a json file in the format of the web app. Many edits
# of types and adding threat levels manually is still needed.

# - filter out know bad text (text from between pages)
# - Join all of thext between "SWZ[0-9][0-9]"
# - find ship names at the end of a line  (need to fuzzy match because of typos
#   and different formatting with cards.json)
# - move ship name text to beginning of next line
# - use regex to convert a line to a json object
#   - "ship name", "SWZ..", "pilot name", [ "upgrades starting with ucode" ]
#   - SWZ and the unicode are known text to match against, and text between are
#     ships and pilots

# Get the pattern for rewrap-lines.awk. First copy the ships from app-metadata.json to ship_types.txt
grep '"name"' <ship_types.txt | sed -e 's@.*"name": "\([^"]*\)".*@\1@' -e 's@<[^>]*>@@g' -e 's@ .*@@' | awk -v ORS='|' 1 > ship_pat.txt

(
	gawk -f join-lines.awk < quick-build-raw.txt \
		| tee s0 \
		| gawk -f rewrap-lines.awk \
		| tee s1 \
		| tail +2 \
 		| gsed \
			  -e 's@\(\o363\o262\o201\o213\|\o363\o262\o201\o213\o363\o262\o201\o213\)@ "upgrade_type": 1,    "name": @g' \
              -e 's@\(\o363\o262\o201\o214\|\o363\o262\o201\o214\o363\o262\o201\o214\)@ "upgrade_type": 2,    "name": @g' \
              -e 's@\(\o363\o262\o201\o215\|\o363\o262\o201\o215\o363\o262\o201\o215\)@ "upgrade_type": 3,    "name": @g' \
              -e 's@\(\o363\o262\o201\o216\|\o363\o262\o201\o216\o363\o262\o201\o216\)@ "upgrade_type": 4,    "name": @g' \
              -e 's@\(\o363\o262\o201\o217\|\o363\o262\o201\o217\o363\o262\o201\o217\)@ "upgrade_type": 5,    "name": @g' \
              -e 's@\(\o363\o262\o201\o220\|\o363\o262\o201\o220\o363\o262\o201\o220\)@ "upgrade_type": 6,    "name": @g' \
              -e 's@\(\o363\o262\o201\o222\|\o363\o262\o201\o222\o363\o262\o201\o222\)@ "upgrade_type": 8,    "name": @g' \
              -e 's@\(\o363\o262\o201\o224\|\o363\o262\o201\o224\o363\o262\o201\o224\)@ "upgrade_type": 10,   "name": @g' \
              -e 's@\(\o363\o262\o201\o226\|\o363\o262\o201\o226\o363\o262\o201\o226\)@ "upgrade_type": 12,   "name": @g' \
              -e 's@\(\o363\o262\o201\o230\|\o363\o262\o201\o230\o363\o262\o201\o230\)@ "upgrade_type": 13,   "name": @g' \
              -e 's@\(\o363\o262\o201\o231\|\o363\o262\o201\o231\o363\o262\o201\o231\)@ "upgrade_type": 14,   "name": @g' \
              -e 's@\(\o363\o262\o201\o232\|\o363\o262\o201\o232\o363\o262\o201\o232\)@ "upgrade_type": 15,   "name": @g' \
              -e 's@\(\o363\o262\o210\o246\|\o363\o262\o210\o246\o363\o262\o210\o246\)@ "upgrade_type": 16,   "name": @g' \
              -e 's@\(\o363\o262\o210\o242\|\o363\o262\o210\o242\o363\o262\o210\o242\)@ "upgrade_type": 17,   "name": @g' \
              -e 's@\(\o363\o262\o210\o241\|\o363\o262\o210\o241\o363\o262\o210\o241\)@ "upgrade_type": 18,   "name": @g' \
              -e 's@\(\o363\o262\o201\o233\|\o363\o262\o201\o233\o363\o262\o201\o233\)@ "upgrade_type": 19,   "name": @g' \
              -e 's@\(\o363\o262\o220\o204\|\o363\o262\o220\o204\o363\o262\o220\o204\)@ "upgrade_type": 999,  "name": @g' \
              -e 's@\(\o363\o262\o220\o202\|\o363\o262\o220\o202\o363\o262\o220\o202\)@ "upgrade_type": 1000, "name": @g' \
			  | gsed -e 's@name":  *\([^"]*[^" ]\) *\("\|$\)@name": "\1", \2@g' \
		| tee s2 \
		| gsed -e 's@^\(.*[^ ]\)  *\(SWZ[0-9][0-9]\)  *\([^"]*\)\(\([^ ]\)  *\(.*\)\|\)$@"ship": "\1", "wave": "\2", "pilot": "\3\5", \6@' \
		| tee s3 \
		| gsed \
				-e 's@\("upgrade_type":.*\), *$@[ \1 ],@' \
				-e 's@\[ "upgrade_type@"upgrades": [ { "upgrade_type@' \
				-e 's@, "upgrade_type@ }, { "upgrade_type@g' \
				-e 's@]@} ]@' \
		| awk '
	       /\<x2\>/ { printf("{ \"threat_level\": 1, \"faction_id\": 2, \"ships\": [ { %s }, { %s } ] },\n", $0, $0) ; next }
		     { printf("{ \"threat_level\": 1, \"faction_id\": 2, \"ships\": [ { %s } ] },\n", $0) } ' \
		| gsed -e 's@, *}@ }@g' \
		| tee s4 \
		| awk 'BEGIN { print "{ \"builds\": [" } ; { print } ; END { print " {}\n ] }" }' \
		| tee s5 \
		| json_reformat \
		| gsed -e 's@  *",@",@g' -e 's@  *" *$@"@g' -e 's@\(pilot.*\)  *\((x2)\|x2\)@\1@'
)
