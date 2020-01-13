namespace XWing {

	enum CardType {
		Pilot = 1,
		Upgrade = 2,
	}

	enum ShipSize {
		Small = 1,
		Medium = 2,
		Large = 3,
	}

	enum Faction {
		RebelAlliance = 1,
		GalacticEmpire = 2,
        ScumAndVillainy = 3,
		Resistance = 4,
		FirstOrder = 5,
		GalacticRepublic = 6,
		SeparatistAlliance = 7,
	}

	enum CardStat {
		Agility = 1,
		Hull = 2,
		Shields = 3,
		Force = 4,
		Charge = 7,
		DualMobileArc = 8,
		Front180Arc = 9,
		FrontArc = 10,
		FrontBullseyeArc = 11,
		MobileArc = 12,
		RearArc = 14,
		WeaponRangeNoBonus = 20,
	}

	enum UpgradeType {
		Talent = 1,
		Sensor = 2,
		Cannon = 3,
		Turret = 4,
		Torpedo = 5,
		Missile = 6,
		Crew = 8,
		Astromech = 10,
		Device = 12,
		Illicit = 13,
		Modification = 14,
		Title = 15,
		Gunner = 16,
		ForcePower = 17,
		Configuration = 18,
		Tech = 19,
		Special = 999,
		TacticalRelay = 1000,
    }

	enum ShipType {
		Modified_YT_1300_Light_Freighter = 1,
		StarViper_class_Attack_Platform = 3,
		Scurrg_H_6_bomber = 4,
		YT_2400_Light_Freighter = 5,
		Auzituck_Gunship = 6,
		Kihraxz_Fighter = 7,
		Sheathipede_class_Shuttle = 8,
		Quadrijet_Transfer_Spacetug = 9,
		Firespray_class_Patrol_Craft = 10,
		TIE_ln_Fighter = 11,
		BTL_A4_Y_wing = 12,
		TIE_Advanced_x1 = 13,
		Alpha_class_Star_Wing = 14,
		UT_60D_U_wing = 15,
		TIE_sk_Striker = 16,
		A_SF_01_B_wing = 17,
		TIE_D_Defender = 18,
		TIE_sa_Bomber = 19,
		TIE_ca_Punisher = 20,
		Aggressor_Assault_Fighter = 21,
		G_1A_Starfighter = 22,
		VCX_100_Light_Freighter = 23,
		YV_666_Light_Freighter = 24,
		TIE_Advanced_v1 = 25,
		Lambda_class_T_4a_Shuttle = 26,
		TIE_ph_Phantom = 27,
		VT_49_Decimator = 28,
		TIE_ag_Aggressor = 29,
		BTL_S8_K_wing = 30,
		ARC_170_Starfighter = 31,
		Attack_Shuttle = 32,
		T_65_X_wing = 33,
		HWK_290_Light_Freighter = 34,
		RZ_1_A_wing = 35,
		Fang_Fighter = 36,
		Z_95_AF4_Headhunter = 38,
		M12_L_Kimogila_Fighter = 39,
		E_wing = 40,
		TIE_in_Interceptor = 41,
		Lancer_class_Pursuit_Craft = 42,
		TIE_Reaper = 43,
		M3_A_Interceptor = 44,
		JumpMaster_5000 = 45,
		Customized_YT_1300_Light_Freighter = 47,
		Escape_Craft = 48,
		TIE_fo_Fighter = 49,
		TIE_sf_Fighter = 50,
		Upsilon_class_Shuttle = 51,
		TIE_vn_Silencer = 52,
		T_70_X_wing = 53,
		RZ_2_A_wing = 54,
		MG_100_StarFortress = 55,
		Modified_TIE_ln_Fighter = 56,
		Scavenged_YT_1300_Light_Freighter = 57,
		Belbullab_22_Starfighter = 58,
		Vulture_class_Droid_Fighter = 59,
		Sith_Infiltrator = 60,
		Delta_7_Aethersprite = 61,
		V_19_Torrent_Starfighter = 62,
		Naboo_Royal_N_1_Starfighter = 63,
		Resistance_Transport = 64,
		Resistance_Transport_Pod = 65,
		Hyena_class_Droid_Bomber = 66,
		Nantex_class_Starfighter = 67,
		BTL_B_Y_wing = 68,
	}

	interface VariablePointCostJson {
		name: string
		type: string
		costs: number[]
		upgradeType: UpgradeType
	}

	interface MetaCardStatJson {
		readonly id: CardStat
		readonly name: string
	}

	interface MetaShipTypeJson {
		readonly id: ShipType
		readonly name: string
		readonly icon: string
	}

	interface MetadataJson {
		ship_types: MetaShipTypeJson[]
		card_stats: MetaCardStatJson[]
	}

	interface UpgradeAndTypeJson {
		upgrade_type: UpgradeType
		name: string
	}

	interface CardStatJson {
		readonly statistic_id: CardStat
		readonly value: string
		readonly recurring: boolean
	}

	interface UpgradeCardJson {
		name: string
		card_image: string
		card_type_id: CardType
		statistics: CardStatJson[]
		cost: string
		upgrade_types: UpgradeType[]
		restrictions: any
	}

	interface PilotCardJson {
		name: string
		card_image: string
		card_type_id: CardType
		statistics: CardStatJson[]
		cost: string
		faction_id: Faction
		ship_type: ShipType
		ship_size: ShipSize
		initiative: number
	}

	interface ShipJson {
		pilot: string
		ship: string
		upgrades: UpgradeAndTypeJson[]
	}

	interface QuickBuildJson {
		threat_level: number
		faction_id: Faction
		ships: ShipJson[]
	}

	export class Card {
		readonly name: string
		readonly imageUrl: string
		readonly cost: number
		readonly statistics: CardStatJson[]

		constructor(card: UpgradeCardJson | PilotCardJson) {
			this.name = card.name
			this.imageUrl = card.card_image
			this.statistics = card.statistics
			// TODO: implement a better way to check if an upgrade card is 2
			// sided. We set one side to cost 0 so it is not double counted.
			this.cost = card.name.endsWith(" (Closed)") ? 0 : card.cost == "*" ? -1 : parseInt(card.cost)
		}

		localImageUrl(): string {
			return "png/" + this.imageUrl.substr(this.imageUrl.lastIndexOf("/"))
		}
	}

	export class Upgrade extends Card {
		readonly upgradeType: UpgradeType
		readonly restrictions: any

		constructor(upgrade: UpgradeCardJson) {
			super(upgrade)
			this.upgradeType = upgrade.upgrade_types[0]
			this.restrictions = upgrade.restrictions
		}

		isConfiguration(): boolean {
			return this.upgradeType == UpgradeType.Configuration
		}

		isUpgradeType(upgradeType: UpgradeType): boolean {
			return this.upgradeType == upgradeType
		}

		isRestrictionOk(restrictionType: string, callback: (r: any) => boolean): boolean {
			if (!this.restrictions) {
				return true
			}
			var matches = this.restrictions.filter((restriction: any) => restriction[0].type == restrictionType)
			if (matches.length == 0) {
				return true
			}
			if (matches[0].find(callback)) {
				return true
			}
			return false
		}

		isFactionOk(faction: Faction): boolean {
			return this.isRestrictionOk("FACTION", (restriction: any) => restriction.kwargs.pk == faction)
		}

		isShipTypeOk(shipType: ShipType): boolean {
			return this.isRestrictionOk("SHIP_TYPE", (restriction: any) => restriction.kwargs.pk == shipType)
		}
	}

	export class Pilot extends Card {
		readonly faction: Faction;
		readonly shipType: ShipType;
		readonly shipSize: ShipSize;
		readonly initiative: number;
		readonly agility: number;

		constructor(pilot: PilotCardJson) {
			super(pilot)
			this.faction = pilot.faction_id;
			this.shipType = pilot.ship_type;
			this.shipSize = pilot.ship_size;
			this.initiative = pilot.initiative;
			this.agility = parseInt(pilot.statistics.find((stat: CardStatJson) => stat.statistic_id == CardStat.Agility).value)
		}

		isFaction(faction: Faction): boolean {
			return this.faction == faction
		}
	}

	export class Ship {
		readonly pilot: Pilot
		readonly upgrades: Upgrade[]
		readonly totalCost: number

		constructor(data: Data, faction: Faction, ship: ShipJson) {
			this.pilot = data.lookupPilot(ship.pilot, faction, ship.ship)
			var newUpgrades: Upgrade[] = new Array()
			if (this.pilot && ship.upgrades) {
				for (var i = 0; i < ship.upgrades.length; i++) { 
					newUpgrades.push(data.lookupUpgrade(ship.upgrades[i], faction, this.pilot.shipType))
				}
			}
			this.upgrades = newUpgrades
			this.totalCost = this.pilot ? this.computeTotalCost(data) : 0
		}

		title(): string {
			return this.pilot.name + " (" + this.totalCost + ")"
		}

		computeTotalCost(data: Data): number {
			return this.pilot.cost + this.upgrades.reduce((acc: number, upgrade: Upgrade) => acc + this.computeUpgradeCost(data, upgrade), 0)
		}

		computeUpgradeCost(data: Data, upgrade: Upgrade): number {
			if (upgrade.cost == -1) {
				var variablePointCost: VariablePointCostJson = data.lookupVariablePointCost(upgrade.name)
				if (variablePointCost) {
					switch (variablePointCost.type) {
						case "SHIP_SIZE":
							return variablePointCost.costs[this.pilot.shipSize - 1]
						case "AGILITY":
							return variablePointCost.costs[this.pilot.agility]
						case "INITIATIVE":
							return variablePointCost.costs[this.pilot.initiative]
					}
				}
				console.log("No point cost for " + upgrade.name)
				return 0
			}
			return upgrade.cost
		}

		getConfigurationUpgrades(): Upgrade[] {
			return this.upgrades.filter((upgrade: Upgrade) => upgrade.isConfiguration() )

		}

		getNonConfigurationUpgrades(): Upgrade[] {
			return this.upgrades.filter((upgrade: Upgrade) => !upgrade.isConfiguration() )

		}
	}

	export class QuickBuild {
		readonly faction: Faction
		readonly threatLevel: number
		readonly ships: Ship[]

		constructor(data: Data, build: QuickBuildJson) {
			this.faction = build.faction_id
			this.threatLevel = build.threat_level
			var newShips: Ship[] = new Array()
			for (var i = 0; i < build.ships.length; i++) {
				var newShip = new Ship(data, this.faction, build.ships[i])
				if (newShip.pilot) {
					newShips.push(newShip)
				} else {
					console.log("Could not convert ship for " + build.ships[i].pilot + " " + build.ships[i].ship) 
				}
			}
			this.ships = newShips
		}
	}

	export class Data {
		readonly pilots: Pilot[]
		readonly upgrades: Upgrade[]
		readonly quickBuilds: QuickBuild[]
		readonly metadata: MetadataJson
		readonly variablePointCosts: VariablePointCostJson[]

		constructor(cards: Array<PilotCardJson|UpgradeCardJson>, quickbuilds: QuickBuildJson[], metadata: MetadataJson, variablePointCosts: VariablePointCostJson[]) {
			this.metadata = metadata
			this.variablePointCosts = variablePointCosts
			var newPilots: Pilot[] = new Array()
			var newUpgrades: Upgrade[] = new Array()
			for (var i = 0; i < cards.length; i++) {
				if (cards[i].card_type_id == CardType.Pilot) {
					newPilots.push(new Pilot(cards[i] as PilotCardJson))
				} else if (cards[i].card_type_id == CardType.Upgrade) {
					newUpgrades.push(new Upgrade(cards[i] as UpgradeCardJson))
				}
			}
			this.pilots = newPilots
			this.upgrades = newUpgrades
			var newQuickBuilds: QuickBuild[] = new Array()
			for (var i = 0; i < quickbuilds.length; i++) {
				newQuickBuilds.push(new QuickBuild(this, quickbuilds[i]))
			}
			newQuickBuilds.sort((a: QuickBuild, b:QuickBuild) => a.ships.length == b.ships.length ? a.ships[0].upgrades.length - b.ships[0].upgrades.length : a.ships.length - b.ships.length)
			this.quickBuilds = newQuickBuilds
		}

		private lookup(name: string, filterCallback: (card: any) => boolean, cards: Card[], cardType: string): any {
			var matches = cards.filter((card: Card) => card.name == name)
			var hasExactMatches: boolean = matches.length > 0
			if (!matches || matches.length == 0) {
				matches = cards.filter((card: Card) => card.name.endsWith(name))
			}
			if (!matches || matches.length == 0) {
				matches = cards.filter((card: Card) => card.name.indexOf(name) != -1)
			}
			if (matches && matches.length > 0) {
				if (matches.length == 1) {
					// This doesn't verify any restrictions. Some quick builds ignore restrictions.
					if (!hasExactMatches) {
						console.log("s@'" + name + "'@'" + matches[0].name +"'@")
					}
					return matches[0]
				}
				matches = matches.filter(filterCallback)
				if (matches.length == 1) {
					if (!hasExactMatches) {
						console.log("s@'" + name + "'@'" + matches[0].name +"'@")
					}
					return matches[0]
				}
				if (matches.length > 1) {
					if (!hasExactMatches) {
						for (var i = 0; i < matches.length; i++) {
							console.log("s@'" + name + "'@'" + matches[i].name +"'@")
						}
					}
					return matches[0]
				}
			}
			console.log("No matches for " + cardType + "! " + name)
			return null
		}

		checkPilot(pilot: Pilot, faction: Faction, shipType: ShipType): boolean {
			return pilot.isFaction(faction) && pilot.shipType == shipType
		}

		lookupPilot(name: string, faction: Faction, shipTypeName: string): Pilot {
			let shipType = this.lookupShipTypeId(shipTypeName)
			return this.lookup(name, (pilot: Pilot) => this.checkPilot(pilot, faction, shipType), this.pilots, "pilot")
		}

		checkUpgrade(upgrade: Upgrade, upgradeType: UpgradeType, faction: Faction, shipType: ShipType): boolean {
			return upgrade.isUpgradeType(upgradeType) && upgrade.isFactionOk(faction) && upgrade.isShipTypeOk(shipType)
		}

		lookupUpgrade(query: UpgradeAndTypeJson, faction: Faction, shipType: ShipType): Upgrade {
			return this.lookup(query.name, (upgrade: Upgrade) => this.checkUpgrade(upgrade, query.upgrade_type, faction, shipType), this.upgrades, "upgrade")
		}

		lookupShipTypeId(name: string): ShipType {
			var result: MetaShipTypeJson = this.metadata.ship_types.find((ship: MetaShipTypeJson) => ship.name == name)
			if (!result) {
				console.log("No matching ship type for: " + name)
			}
			return result.id

		}

		lookupVariablePointCost(upgradeName: string) {
			return this.variablePointCosts.find((variablePointCost: VariablePointCostJson) => variablePointCost.name == upgradeName)
		}
	}
}
