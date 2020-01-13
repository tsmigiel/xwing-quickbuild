BEGIN { prev_line = "" }
/^ship pilot upgrades threat$/ { next }
/^Quick Build Reference$/ { next }
/©/ { next }
/SWZ[0-9][0-9]/ {
		printf("%s %s\n", prev_line, substr($0, 0, match($0, "SWZ[0-9][0-9]") - 1))
		prev_line = substr($0, match($0, "SWZ[0-9][0-9]"))
		next
	}
	{ prev_line = sprintf("%s %s", prev_line, $0) }
END {
	printf("%s\n", prev_line)
}
