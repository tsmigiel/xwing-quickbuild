/// <referenc path="xwing/cards.js"></script>
/// <referenc path="xwing/cards_extensions.js"></script>
/// <referenc path="xwing/metadata.js"></script>
/// <referenc path="xwing/quick-build.js"></script>
/// <referenc path="xwing/variable-point-cost.js"></script>
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

	export enum FactionId {
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

	interface UpgradeAndTypeJson {
		upgrade_type: UpgradeType
		name: string
	}


	interface ShipJson {
		pilot: string
		ship: string
		upgrades: UpgradeAndTypeJson[]
	}

	interface QuickBuildJson {
		threat_level: number
		faction_id: FactionId
		ships: ShipJson[]
	}

	interface QuickBuildsJson {
		builds: QuickBuildJson[]
	}

	interface CardLookup {
		readonly name: string
	}

	export class Upgrade {
		readonly json: Json.UpgradeCard
		readonly name: string
		readonly cost: number
		readonly upgradeType: UpgradeType
		readonly restrictions: any

		constructor(upgrade: Json.UpgradeCard) {
			this.json = upgrade
			this.name = upgrade.name
			this.cost = this.name.endsWith(" (Closed)") ? 0 : this.json.cost == "*" ? -1 : parseInt(this.json.cost)
			this.upgradeType = upgrade.upgrade_types[0]
			this.restrictions = upgrade.restrictions
		}

		localImageUrl(): string {
			return "png/" + this.json.card_image.substr(this.json.card_image.lastIndexOf("/"))
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

		isFactionOk(factionId: FactionId): boolean {
			return this.isRestrictionOk("FACTION", (restriction: any) => restriction.kwargs.pk == factionId)
		}

		isShipTypeOk(shipType: ShipType): boolean {
			return this.isRestrictionOk("SHIP_TYPE", (restriction: any) => restriction.kwargs.pk == shipType)
		}
	}

	export class Pilot {
		readonly json: Json.PilotCard
		readonly name: string
		readonly cost: number
		readonly factionId: FactionId;
		readonly shipType: ShipType;
		readonly shipSize: ShipSize;
		readonly initiative: number;
		readonly agility: number;

		constructor(pilot: Json.PilotCard) {
			this.json = pilot
			this.name = pilot.name
			this.cost = parseInt(pilot.cost)
			this.factionId = pilot.faction_id;
			this.shipType = pilot.ship_type;
			this.shipSize = pilot.ship_size;
			this.initiative = pilot.initiative;
			this.agility = parseInt(pilot.statistics.find((stat: Json.Statistic) => stat.statistic_id == CardStat.Agility).value)
		}

		localImageUrl(): string {
			return "png/" + this.json.card_image.substr(this.json.card_image.lastIndexOf("/"))
		}

		isFaction(factionId: FactionId): boolean {
			return this.factionId == factionId
		}

		uniqueCount(): number {
			// FIXME: this always returns 1 or 0. It should return the number of "•"
			return this.name.indexOf("•") + 1
		}
	}

	export class Ship {
		readonly pilot: Pilot
		readonly upgrades: Upgrade[]
		readonly totalCost: number
		buildTitle: string

		constructor(data: Data, factionId: FactionId, ship: ShipJson) {
			this.pilot = data.lookupPilot(ship.pilot, factionId, ship.ship)
			var newUpgrades: Upgrade[] = new Array()
			if (this.pilot && ship.upgrades) {
				for (var i = 0; i < ship.upgrades.length; i++) {
					newUpgrades.push(data.lookupUpgrade(ship.upgrades[i], factionId, this.pilot.shipType))
				}
			}
			this.upgrades = newUpgrades
			this.totalCost = this.pilot ? this.computeTotalCost(data) : 0
			this.buildTitle = ""
		}

		setBuildTitle(title: string) {
			this.buildTitle = title
		}

		title(): string {
			return this.pilot.name + " (" + this.totalCost + ")"
		}

		computeTotalCost(data: Data): number {
			return this.pilot.cost + this.upgrades.reduce((acc: number, upgrade: Upgrade) => acc + this.computeUpgradeCost(data, upgrade), 0)
		}

		computeUpgradeCost(data: Data, upgrade: Upgrade): number {
			if (!upgrade) {
				// This issue has already been logged, return a crazy number
				return 1000
			}
			if (upgrade.cost == -1) {
				var variablePointCost: Json.VariablePointCost = data.lookupVariablePointCost(upgrade.name)
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
		readonly factionId: FactionId
		readonly threatLevel: number
		readonly ships: Ship[]
		readonly title: string

		constructor(data: Data, build: QuickBuildJson) {
			this.factionId = build.faction_id
			this.threatLevel = build.threat_level
			var newShips: Ship[] = new Array<Ship>()
			if (build.ships) {
				for (var i = 0; i < build.ships.length; i++) {
					var newShip = new Ship(data, this.factionId, build.ships[i])
					if (newShip.pilot) {
						newShips.push(newShip)
					}
				}
				if (newShips.length > 0) {
					var buildTitle: string = build.threat_level.toString() + ": " + newShips[0].title()
					if (newShips.length == 2 && newShips[0].title() == newShips[1].title()) {
							buildTitle += " (x2)"
					} else {
						for (var s = 1; s < newShips.length; s++) {
							buildTitle += " + " + newShips[s].title()
						}
					}
					this.title = buildTitle
				}
				for (var s = 0; s < newShips.length; s++) {
					newShips[s].setBuildTitle(buildTitle)
				}
			}
			this.ships = newShips
		}

		isValid(): boolean {
			return this.ships.length > 0 && this.ships.reduce<boolean>((acc: boolean, ship: Ship) => (ship.pilot ? acc : false), true)
		}
	}

	export class Data {
		readonly pilots: Pilot[]
		readonly upgrades: Upgrade[]
		readonly quickBuilds: QuickBuild[]
		readonly metadata: Json.Metadata
		readonly extensions: Json.Extension[]
		readonly variablePointCosts: Json.VariablePointCost[]

		constructor(
				pilots: Json.PilotCard[],
				upgrades: Json.UpgradeCard[],
				quickbuilds: QuickBuildsJson[],
				metadata: Json.Metadata,
				extensions: Json.CardsExtensions,
				variablePointCosts: Json.VariablePointCost[]) {
			this.metadata = metadata
			this.extensions = extensions.extensions
			this.variablePointCosts = variablePointCosts
			this.pilots = pilots.map((p: Json.PilotCard) => new Pilot(p))
			this.upgrades = upgrades.map((u: Json.UpgradeCard) => new Upgrade(u))
			var newQuickBuilds: QuickBuild[] = new Array()
			for (var i = 0; i < quickbuilds.length; i++) {
				for (var j = 0; j < quickbuilds[i].builds.length; j++) {
					var newBuild = new QuickBuild(this, quickbuilds[i].builds[j])
					if (newBuild.isValid()) {
						newQuickBuilds.push(newBuild)
					} else {
						console.log("Failed to create QuickBuild.")
						console.log(quickbuilds[i].builds[j])
					}
				}
			}
			this.quickBuilds = newQuickBuilds
		}

		private lookup(name: string, filterCallback: (card: any) => boolean, cards: CardLookup[], cardType: string): any {
			var matches: CardLookup[] = cards.filter((card: CardLookup) => card.name == name)
			var hasExactMatches: boolean = matches.length > 0
			if (!matches || matches.length == 0) {
				matches = cards.filter((card: CardLookup) => card.name.endsWith(name))
			}
			if (!matches || matches.length == 0) {
				matches = cards.filter((card: CardLookup) => card.name.indexOf(name) != -1)
			}
			if (matches && matches.length > 0) {
				if (matches.length == 1) {
					// This doesn't verify any restrictions. Some quick builds ignore restrictions.
					if (!hasExactMatches) {
						console.log("s@\"" + name + "\"@\"" + matches[0].name +"\"@")
					}
					return matches[0]
				}
				matches = matches.filter(filterCallback)
				if (matches.length == 1) {
					if (!hasExactMatches) {
						console.log("s@\"" + name + "\"@\"" + matches[0].name +"\"@")
					}
					return matches[0]
				}
				if (matches.length > 1) {
					if (!hasExactMatches) {
						for (var i = 0; i < matches.length; i++) {
							console.log("s@\"" + name + "\"@\"" + matches[i].name +"\"@")
						}
					}
					return matches[0]
				}
			}
			var regex:RegExp = new RegExp(name.replace(/[^A-Za-z0-9]+/g, ".*"), "i")
			matches = cards.filter((card: CardLookup) => card.name.match(regex) != null)
			if (matches.length > 0) {
				if (matches.length == 1) {
					console.log("s@\"" + name + "\"@\"" + matches[0].name +"\"@")
					return matches[0]
				}
				console.log(matches)
			}
			console.log("No matches for " + cardType + "! " + name)
			return null
		}

		checkPilot(pilot: Pilot, factionId: FactionId, shipType: ShipType): boolean {
			return pilot.isFaction(factionId) && pilot.shipType == shipType
		}

		lookupPilot(name: string, factionId: FactionId, shipTypeName: string): Pilot {
			let shipType = this.lookupShipTypeId(shipTypeName)
			return this.lookup(name, (pilot: Pilot) => this.checkPilot(pilot, factionId, shipType), this.pilots, "pilot")
		}

		checkUpgrade(upgrade: Upgrade, upgradeType: UpgradeType, factionId: FactionId, shipType: ShipType): boolean {
			return upgrade.isUpgradeType(upgradeType) && upgrade.isFactionOk(factionId) && upgrade.isShipTypeOk(shipType)
		}

		lookupUpgrade(query: UpgradeAndTypeJson, factionId: FactionId, shipType: ShipType): Upgrade {
			return this.lookup(query.name, (upgrade: Upgrade) => this.checkUpgrade(upgrade, query.upgrade_type, factionId, shipType), this.upgrades, "upgrade")
		}

		lookupShipTypeId(name: string): ShipType {
			var result: Json.ShipType = this.metadata.ship_types.find((ship: Json.ShipType) => ship.name == name)
			if (result) {
				return result.id
			}
			var regex:RegExp = new RegExp(name.replace(/[^A-Za-z0-9]+/g, ".*"), "i")
			var matches: Json.ShipType[] = this.metadata.ship_types.filter((ship: Json.ShipType) => ship.name.match(regex) != null)
			if (matches.length > 0) {
				if (matches.length == 1) {
					console.log("s@\"" + name + "\"@\"" + matches[0].name +"\"@")
					return matches[0].id
				}
				console.log(matches)
			}
			console.log("No matching ship type for: " + name)
			return null

		}

		lookupVariablePointCost(upgradeName: string) {
			return this.variablePointCosts.find((variablePointCost: Json.VariablePointCost) => variablePointCost.name == upgradeName)
		}

		availableFactions(): FactionId[] {
			var factionIds: Set<FactionId> = this.quickBuilds.reduce((acc, build) => acc.add(build.factionId), new Set<FactionId>())
			return [...factionIds].sort()
		}

		lookupFactionMetadata(factionId: FactionId): Json.Faction {
			return this.metadata.factions.find((faction: Json.Faction) => faction.id == factionId)
		}

		availableShipTypes(factionId: FactionId): ShipType[] {
			let shipTypes: Set<ShipType> = new Set()
			this.quickBuilds
				.filter((build: QuickBuild) => build.factionId == factionId)
				.forEach(function(item: QuickBuild) {
					item.ships.reduce((acc, ship) => acc.add(ship.pilot.shipType), shipTypes)
				})
			return [...shipTypes]
		}

		lookupShipTypeMetadata(shipTypeId: ShipType): Json.ShipType {
			return this.metadata.ship_types.find((shipType: Json.ShipType) => shipType.id == shipTypeId)
		}

		availableExtensions(factionId: FactionId): number[] {
			let extensions: Set<number> = new Set()
			this.quickBuilds
				.filter((build: QuickBuild) => build.factionId == factionId)
				.forEach(function(build: QuickBuild) {
					build.ships.forEach((ship: Ship) => ship.pilot.json.card_set_ids.forEach((ext: number) => extensions.add(ext)))
				})
			return [...extensions]
		}

		lookupExtension(extensionId: number): Json.Extension {
			return this.extensions.find((extension: Json.Extension) => extension.id == extensionId)
		}
	}
}
