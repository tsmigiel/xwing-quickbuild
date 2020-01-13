BEGIN {
	regex="YT-2400|Auzituck|Kihraxz|Firespray-class|TIE/ln|TIE/fo|Modified|Scavenged|Customized|Scurrg|Modified|Sheathipede-class|Quadrijet|TIE/sf|Upsilon-class|TIE/vn|T-70|RZ-2|MG-100|Resistance|BTL-B|ARC-170|T-65|HWK-290|RZ-1|Fang|E-wing|TIE|M3-A|JumpMaster|Escape|Resistance|BTL-A4|G-1A|VCX-100|YV-666|Lambda-class|TIE/ph|VT-49|TIE/ag|BTL-S8|Attack|Hyena-class|Nantex-class|Z-95-AF4|M12-L|TIE/in|Lancer-class|Belbullab-22|Naboo|StarViper-class|TIE|Alpha-class|UT-60D|TIE/sk|A/SF-01|TIE/D|TIE/sa|TIE/ca|Aggressor|TIE|Vulture-class|Sith|Delta-7|V-19"
	prev_line = ""
}
	{
		pos = match($0, regex)
		if (pos == 0) {
			printf("%s %s\n", prev_line, $0)
		} else {
			printf("%s %s\n", prev_line, substr($0, 0, pos - 1))
			prev_line = substr($0, pos)
		}
	}

