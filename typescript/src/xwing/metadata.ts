namespace XWing.Json {

	export interface Metadata {
		supported_languages: SupportedLanguage[];
		force_affiliation:   ForceAffiliation[];
		ship_size:           ShipSize[];
		ship_types:          ShipType[];
		card_stats:          CardStat[];
		card_types:          CardType[];
		factions:            Faction[];
		card_action_types:   CardActionType[];
		upgrade_types:       UpgradeType[];
	}

	export interface CardActionType {
		id:          number;
		name:        string;
		description: string;
		font_icon:   string;
	}

	export interface UpgradeType {
		id:          number;
		name:        string;
		description: string;
		font_icon:   string;
	}

	export interface CardStat {
		id:          number;
		name:        string;
		description: string;
		icon:        string;
		color:       string;
		groups:      string[];
	}

	export interface ForceAffiliation {
		id:   number;
		name: string;
	}

	export interface ShipSize {
		id:   number;
		name: string;
	}

	export interface CardType {
		id:   number;
		name: string;
	}

	export interface Faction {
		id:              number;
		name:            string;
		description:     string;
		icon:            string;
		banner_mobile:   string;
		banner:          string;
		ship_art:        string;
		ship_art_mobile: string;
	}

	export interface ShipType {
		id:          number;
		name:        string;
		description: Description;
		icon:        string;
	}

	export enum Description {
		Empty = "",
		Test = "Test",
	}

	export interface SupportedLanguage {
		id:   string;
		name: string;
	}

}
