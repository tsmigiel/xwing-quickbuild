/// <reference path="XWing.ts" />

interface LayoutSize {
	width: number
	height: number
	configWidth: number
	configHeight: number
	nonConfigWidth: number
	nonConfigHeight: number
}

interface FilterItem {
	id: number
	name: string
}

class MainViewModel {
	checkedCheckboxes: Map<string,Set<string>> = new Map()

	shouldDisplayQuickBuild(build: XWing.QuickBuild) {
	    var shouldDisplayFaction: boolean = this.isChecked("faction", build.factionId.toString(), false)
	    var shouldDisplayShipTypes: boolean = build.ships.reduce((acc: boolean, ship: XWing.Ship) => acc || this.shouldDisplayShipByShipType(ship), false)
	    var shouldDisplayExtensions: boolean = build.ships.reduce((acc: boolean, ship: XWing.Ship) => acc || this.shouldDisplayShipByExtension(ship), false)
		return shouldDisplayFaction && shouldDisplayShipTypes && shouldDisplayExtensions
	}

	shouldDisplayShipByShipType(ship: XWing.Ship){
		return this.isChecked("ship_type", ship.pilot.shipType.toString(), true)
	}

	shouldDisplayShipByExtension(ship: XWing.Ship){
		return ship.pilot.json.card_set_ids.reduce((acc: boolean, id: number) => acc || this.isChecked("extension", id.toString(), true), false)
	}

	isChecked(name: string, value: string, resultForEmpty: boolean) {
		if (!this.checkedCheckboxes.has(name) || this.checkedCheckboxes.get(name).size == 0) {
			return resultForEmpty
		}
		return this.checkedCheckboxes.has(name) && this.checkedCheckboxes.get(name).has(value)
	}

	select(name: string, value: string) {
		if (!this.checkedCheckboxes.has(name)) {
			this.checkedCheckboxes.set(name, new Set())
		}
		this.checkedCheckboxes.get(name).add(value)
	}

	deselect(name: string, value: string) {
		if (this.checkedCheckboxes.has(name)) {
			this.checkedCheckboxes.get(name).delete(value)
		}
	}
}

var xwing: XWing.Data
var mainViewModel: MainViewModel = new MainViewModel()

function createPilotNode(pilot: XWing.Pilot) {
	var img = document.createElement('img')
	img.src = pilot.localImageUrl()
	img.classList.add("card_pilot")
	return img
}

function createUpgradeNode(upgrade: XWing.Upgrade, boxClass: string, zIndex: number) {
	var div = document.createElement('div')
	var img = document.createElement('img')
	img.src = upgrade.localImageUrl()
	img.classList.add("card_upgrade")
	div.appendChild(img)
	div.classList.add(boxClass)
	div.style.zIndex = zIndex.toString()
	return div
}

function addUpgrades(shipNode: Node, baseClass: string, upgrades: XWing.Upgrade[]) {
	if (upgrades.length > 0) {
		var upgradeNode = document.createElement('div')
		upgradeNode.classList.add(baseClass)
		for (var i = 0; i < upgrades.length; i++) {
			upgradeNode.appendChild(createUpgradeNode(upgrades[i], "card_" + baseClass + "_box", -(i+1)))
		}
		shipNode.appendChild(upgradeNode)
	}
}

function addPilot(shipNode: Node, pilot: XWing.Pilot) {
	var pilotNode = document.createElement('div')
	pilotNode.classList.add("pilot")
	pilotNode.appendChild(createPilotNode(pilot))
	shipNode.appendChild(pilotNode)
}

function addTitle(shipNode: Node, title: string) {
	var titleNode  = document.createElement('div')
	var titleContent  = document.createElement('p')
	titleContent.classList.add("build_title")
	titleContent.innerHTML = title
	titleNode.classList.add("title")
	titleNode.appendChild(titleContent)
	shipNode.appendChild(titleNode)
}

function createShipNode(ship : XWing.Ship) {
	var shipNode = document.createElement('div')
	shipNode.classList.add("ship")
	var configs = ship.getConfigurationUpgrades()
	var upgrades = ship.getNonConfigurationUpgrades()
	if (ship.upgrades.length == 0) {
		shipNode.setAttribute("upgradeColumns", "p")
	} else {
		/* How many columns used by upgrades assuming 2 rows. */
		shipNode.setAttribute("upgradeColumns", "w".repeat(Math.ceil(configs.length / 2)) + "w".repeat(Math.ceil(upgrades.length / 2)))
	}
	addTitle(shipNode, ship.buildTitle)
	addUpgrades(shipNode, "configuration", configs)
	addPilot(shipNode, ship.pilot)
	addUpgrades(shipNode, "upgrade", upgrades)
	return shipNode
}

function numUpgradeColumns(ship: XWing.Ship, numRows: number): number {
	var numConfig = ship.getConfigurationUpgrades().length
	var numUpgrade = ship.upgrades.length - numConfig
	return Math.ceil(numConfig / numRows) + Math.ceil(numUpgrade / numRows)
}

function sortQuickBuildsForLayout(a: XWing.QuickBuild, b:XWing.QuickBuild) {
	if (a.ships.length != b.ships.length) {
		return b.ships.length - a.ships.length
	}
	var aColumns = 0
	var bColumns = 0
	for (var s = 0; s < a.ships.length; s++) {
		aColumns += numUpgradeColumns(a.ships[s], 2)
		bColumns += numUpgradeColumns(b.ships[s], 2)
	}
	return bColumns - aColumns
}

function displayShips() {
	var builds: XWing.QuickBuild[] = []
	/* Find all builds the user selected. */
	for (var b = 0; b < xwing.quickBuilds.length; b++) {
		var build: XWing.QuickBuild = xwing.quickBuilds[b]
		if (mainViewModel.shouldDisplayQuickBuild(build)) {
			builds.push(build)
		}
	}
	builds.sort(sortQuickBuildsForLayout)
	let buildsNode = document.getElementById("builds")
	buildsNode.innerHTML = ''
	for (var b = 0; b < builds.length; b++) {
		for (var s = 0; s < builds[b].ships.length; s++) {
			var shipNode = createShipNode(builds[b].ships[s])
			shipNode.setAttribute("shipIndex", builds[b].ships.length > 1 ? s.toString() : "x")
			buildsNode.appendChild(shipNode)
		}
	}
}

function handleCheckboxChange(checkboxNode: any) {
	if (checkboxNode.checked) {
		mainViewModel.select(checkboxNode.name, checkboxNode.value)
	} else {
		mainViewModel.deselect(checkboxNode.name, checkboxNode.value)
	}
}

function createCheckbox(key: string, value: string, label: string): Node {
	var labelNode = document.createElement('label')
	let inputNode = document.createElement('input')
	inputNode.type = "checkbox"
	inputNode.name = key
	inputNode.value = value
	inputNode.onchange = () => handleCheckboxChange(inputNode)
	labelNode.appendChild(inputNode)
	let spanNode = document.createElement('span')
	spanNode.innerHTML = label.replace(/\bitalic\b/g, "i")
	labelNode.appendChild(spanNode)
	return labelNode
}

function createFilterTitle(title: string): Node {
	var titleNode = document.createElement('div')
	titleNode.classList.add("filter_title")
	titleNode.innerHTML = title
	return titleNode
}

function createFilterCheckboxes(section: string, items: FilterItem[]): Node {
	var checkboxesNode = document.createElement('div')
	checkboxesNode.classList.add("filter_checkboxes")
	for (var i = 0; i < items.length; i++) {
		checkboxesNode.appendChild(createCheckbox(section, items[i].id.toString(), items[i].name))
	}
	return checkboxesNode
}

function getFilterItemsByShipType(factionId: XWing.FactionId): FilterItem[] {
	return xwing.availableShipTypes(factionId)
		.map((item: number) => xwing.lookupShipTypeMetadata(item))
		.sort((a: XWing.Json.ShipType, b: XWing.Json.ShipType) => a.name.replace(/<italic>/g, "").localeCompare(b.name.replace(/<italic>/g, "")))
}

function getFilterItemsByExtension(factionId: XWing.FactionId): FilterItem[] {
	return xwing.availableExtensions(factionId)
		.sort()
		.map((extensionId: number) => xwing.lookupExtension(extensionId))
}

function toggleVisibility(title: string, titleNode: any, element: any) {
	if (element.style.display == "none") {
		element.style.display = "grid"
		titleNode.innerHTML = "[-] " + title
	} else {
		element.style.display = "none"
		titleNode.innerHTML = "[+] " + title
	}
}

function addFiltersByFaction(filtersNode: Element, factions: XWing.Json.Faction[], title: string, section: string, getFilterItems: any) {
	var filterNode = document.createElement('div')
	var titleNode = document.createElement('div')
	filterNode.classList.add("filter_layout")
	titleNode.classList.add("filter_section_title")
	titleNode.innerHTML = "[+] "+ title
	filtersNode.appendChild(titleNode)
	let sectionNode = document.createElement('div')
	sectionNode.classList.add("filter_subsection")
	sectionNode.style.display = "none"
	titleNode.onclick = () => toggleVisibility(title, titleNode, sectionNode)
	for (var f = 0; f < factions.length; f++) {
		sectionNode.appendChild(createFilterTitle(factions[f].name))
		sectionNode.appendChild(createFilterCheckboxes(section, getFilterItems(factions[f].id)))
	}
	filterNode.appendChild(sectionNode)
	filtersNode.appendChild(filterNode)
}

function createFactionFilter(factions: XWing.Json.Faction[]): Node {
	var filterNode = document.createElement('div')
	filterNode.classList.add("filter_layout")
	filterNode.appendChild(createFilterTitle("Factions"))
	filterNode.appendChild(createFilterCheckboxes("faction", factions))
	return filterNode
}

function createUpdateButton() {
	var inputNode = document.createElement('input')
	inputNode.classList.add("filter_update")
	inputNode.type = "submit"
	inputNode.value = "Update"
	inputNode.onclick = displayShips
	return inputNode
}

function addFiltersToDom() {
	var filtersNode = document.getElementById("filters")
	var factions: XWing.Json.Faction[] = xwing.availableFactions().sort().map((id: XWing.FactionId) => xwing.lookupFactionMetadata(id))
	filtersNode.appendChild(createFactionFilter(factions))
	addFiltersByFaction(filtersNode, factions, "Ship Types", "ship_type", getFilterItemsByShipType)
	addFiltersByFaction(filtersNode, factions, "Extensions (2nd ed. only)", "extension", getFilterItemsByExtension)
	filtersNode.appendChild(createUpdateButton())
}

const loadData = async () => {
	var pilots = await fetch("data/pilots.json").then(r => r.json())
	var upgrades = await fetch("data/upgrades.json").then(r => r.json())
	var metadata = await fetch("data/app-metadata.json").then(r => r.json())
	var extensions = await fetch("data/cards_extensions.json").then(r => r.json())
	var quickBuilds = [
		await fetch("data/quick-build-rebel.json").then(r => r.json()),
		await fetch("data/quick-build-empire.json").then(r => r.json()),
		await fetch("data/quick-build-scum.json").then(r => r.json()),
		await fetch("data/quick-build-resistance.json").then(r => r.json()),
		await fetch("data/quick-build-first-order.json").then(r => r.json()),
		await fetch("data/quick-build-republic.json").then(r => r.json()),
		await fetch("data/quick-build-separatists.json").then(r => r.json())
	]
	var variablePointCosts = await fetch("data/variable-point-cost.json").then(r => r.json())
	xwing = new XWing.Data(pilots.cards, upgrades.cards, quickBuilds, metadata, extensions, variablePointCosts)
	addFiltersToDom()
	displayShips()
}

loadData()
