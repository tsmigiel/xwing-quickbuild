namespace XWing.Json {

	export interface QuickBuilds {
		builds: QuickBuild[];
	}

	export interface QuickBuild {
		threat_level: number;
		faction_id:   number;
		ships:        Ship[];
	}

	export interface Ship {
		ship:      string;
		wave:      String;
		pilot:     string;
		upgrades?: Upgrade[];
	}

	export interface Upgrade {
		upgrade_type: number;
		name:         string;
	}

}
