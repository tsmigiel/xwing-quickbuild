namespace XWing.Json {

	export interface Cards {
		cards: Card[];
	}

	export type Card = PilotCard | UpgradeCard

	export interface PilotCard {
		id:                 number;
		faction_id:         number;
		card_set_ids:       number[];
		card_type_id:       number;
		available_actions:  AvailableAction[];
		statistics:         Statistic[];
		available_upgrades: number[];
		image:              string;
		card_image:         string;
		name:               string;
		subtitle:           string;
		ability_text:       string;
		cost:               string;
		ship_ability_text:  string | null;
		ship_size:          number;
		force_side:         number | null;
		initiative:         number;
		ffg_id:             string;
		ship_type:          number;
	}

	export interface UpgradeCard {
		id:                 number;
		card_set_ids:       number[];
		card_type_id:       number;
		available_actions:  AvailableAction[];
		restrictions:       Array<Restriction[]>;
		upgrade_types:      number[];
		weapon_range:       string | null;
		image:              string;
		card_image:         string;
		name:               string;
		ability_text:       string;
		cost:               string;
		force_side:         number | null;
		weapon_no_bonus:    boolean;
		ffg_id:             string;
	}

	export interface AvailableAction {
		id:                         number;
		base_action_id:             number;
		related_action_id:          number | null;
		base_action_side_effect:    ActionSideEffect | null;
		related_action_side_effect: ActionSideEffect | null;
	}

	export enum ActionSideEffect {
		ForcePoint = "force_point",
		Stress = "stress",
	}

	export interface Restriction {
		type:   RestrictionType;
		kwargs: Kwargs;
	}

	export interface Kwargs {
		ship_size_name?:   ShipSizeName;
		pk?:               number;
		name?:             string;
		side_effect_name?: SideEffectName;
		raw_name?:         string;
		force_side_name?:  string;
		maximum_value?:    number;
		minimum_value?:    number;
		ffg_id?:           string;
	}

	export enum ShipSizeName {
		Large = "LARGE",
		Medium = "MEDIUM",
		Small = "SMALL",
	}

	export enum SideEffectName {
		None = "NONE",
		Stress = "STRESS",
	}

	export enum RestrictionType {
		Action = "ACTION",
		Arc = "ARC",
		CardIncluded = "CARD_INCLUDED",
		Faction = "FACTION",
		ForceSide = "FORCE_SIDE",
		LimitedQuantity = "LIMITED_QUANTITY",
		ShipSize = "SHIP_SIZE",
		ShipType = "SHIP_TYPE",
		SolitaryUpgradeType = "SOLITARY_UPGRADE_TYPE",
		StatisticRestriction = "STATISTIC_RESTRICTION",
		UpgradeTypeEquipped = "UPGRADE_TYPE_EQUIPPED",
	}

	export interface Statistic {
		id:           number;
		statistic_id: number;
		value:        string;
		recurring:    boolean;
	}

}
