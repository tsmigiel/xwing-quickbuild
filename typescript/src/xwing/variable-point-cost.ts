namespace XWing.Json {

	export interface VariablePointCost {
		name:        string;
		type:        VariableType;
		costs:       number[];
		upgradeType: string;
	}

	export enum VariableType {
		Agility = "AGILITY",
		Initiative = "INITIATIVE",
		ShipSize = "SHIP_SIZE",
	}
}
