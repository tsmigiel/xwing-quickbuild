/// <reference path="XWing.ts" />

interface LayoutSize {
	width: number
	height: number
	configWidth: number
	configHeight: number
	nonConfigWidth: number
	nonConfigHeight: number
}

class FilterItem {
	id: number
	name: string
	factionId: number

	constructor(id: number, name: string, factionId: number) {
		this.id = id
		this.name = name
	    this.factionId = factionId
	}

	isEqual(item: FilterItem): boolean {
		return this.id == item.id && this.name == item.name && this.factionId == item.factionId
	}
}

class MainViewModel {
	checkedCheckboxes: Map<string,Set<FilterItem>> = new Map()
	options: Map<string, string> = new Map([[ "page_layout", "landscape_85x11" ]])

	shouldDisplayQuickBuild(build: XWing.QuickBuild) {
	    var shouldDisplayFaction: boolean = this.isChecked("faction", build.factionId, build.factionId)
	    var shouldDisplayShipTypes: boolean = build.ships.reduce((acc: boolean, ship: XWing.Ship) => acc || this.shouldDisplayShipByShipType(ship), false)
	    var shouldDisplayExtensions: boolean = build.ships.reduce((acc: boolean, ship: XWing.Ship) => acc || this.shouldDisplayShipByExtension(ship), false)
		return shouldDisplayFaction || shouldDisplayShipTypes || shouldDisplayExtensions
	}

	shouldDisplayShipByShipType(ship: XWing.Ship){
		return this.isChecked("ship_type", ship.pilot.shipType, ship.pilot.json.faction_id)
	}

	shouldDisplayShipByExtension(ship: XWing.Ship) {
		let factionId: XWing.FactionId = ship.pilot.json.faction_id
		return ship.pilot.json.card_set_ids.reduce(
			(acc: boolean, id: number) => acc || this.isChecked("extension", id, factionId), false)
	}

	isChecked(name: string, value: number, factionId: XWing.FactionId) {
		if (!this.checkedCheckboxes.has(name) || this.checkedCheckboxes.get(name).size == 0) {
			return false
		}
		var hasItem: boolean = false
		for (let item of this.checkedCheckboxes.get(name).values()) {
			hasItem = hasItem || (item.id == value && item.factionId == factionId)
		}
		return hasItem
	}

	pageLayout(): string {
		return this.options.get("page_layout")
	}

	select(name: string, item: FilterItem) {
		if (!this.checkedCheckboxes.has(name)) {
			this.checkedCheckboxes.set(name, new Set())
		}
		this.checkedCheckboxes.get(name).add(item)
	}

	deselect(name: string, item: FilterItem) {
		if (this.checkedCheckboxes.has(name)) {
			let itemSet: Set<FilterItem> = this.checkedCheckboxes.get(name)
			itemSet.forEach((i: FilterItem) => { if (i.isEqual(item)) itemSet.delete(i) })
		}
	}

	setOption(key: string, value: string) {
		this.options.set(key, value)
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
	// The upgradeColumns attribute is used by css. Set the number of columns
	// for 1, 2, and 3 rows so each page layout can choose what it likes.
	for (var rows = 1; rows < 4; rows++) {
		if (ship.upgrades.length == 0) {
			shipNode.setAttribute("upgradeColumns" + rows.toString(), "p")
		} else {
			var configCols = Math.ceil(configs.length / rows)
			var upgradeCols = Math.ceil(upgrades.length / rows)
			shipNode.setAttribute(
				"upgradeColumns" + rows.toString(), "w".repeat(configCols + upgradeCols))
		}
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
		var numRows = mainViewModel.pageLayout() == "landscape_85x11" ? 1 : 2
		aColumns += numUpgradeColumns(a.ships[s], numRows)
		bColumns += numUpgradeColumns(b.ships[s], numRows)
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
	buildsNode.setAttribute("pageLayout", mainViewModel.pageLayout())
	buildsNode.innerHTML = ''
	for (var b = 0; b < builds.length; b++) {
		for (var s = 0; s < builds[b].ships.length; s++) {
			var shipNode = createShipNode(builds[b].ships[s])
			shipNode.setAttribute("shipIndex", builds[b].ships.length > 1 ? s.toString() : "x")
			buildsNode.appendChild(shipNode)
		}
		if (builds[b].ships.length > 1) {
			var eolNode = document.createElement('div')
			eolNode.classList.add("eol")
			buildsNode.appendChild(eolNode)
		}
	}
}

function handleCheckboxChange(checkboxNode: any) {
	var item: FilterItem =
		new FilterItem(
			parseInt(checkboxNode.value),
			checkboxNode.name,
			parseInt(checkboxNode.getAttribute("factionId")))
	if (checkboxNode.checked) {
		mainViewModel.select(checkboxNode.name, item)
	} else {
		mainViewModel.deselect(checkboxNode.name, item)
	}
}

function createCheckbox(key: string, value: string, label: string, factionId: XWing.FactionId): Node {
	var labelNode = document.createElement('label')
	let inputNode = document.createElement('input')
	inputNode.type = "checkbox"
	inputNode.name = key
	inputNode.value = value
	inputNode.setAttribute("factionId", factionId.toString())
	inputNode.onchange = () => handleCheckboxChange(inputNode)
	labelNode.appendChild(inputNode)
	let spanNode = document.createElement('span')
	spanNode.innerHTML = label.replace(/\bitalic\b/g, "i")
	labelNode.appendChild(spanNode)
	return labelNode
}

function createSubsectionTitle(title: string): Node {
	var titleNode = document.createElement('div')
	titleNode.classList.add("subsection_title")
	titleNode.innerHTML = title
	return titleNode
}

function createFilterCheckboxes(section: string, items: FilterItem[]): Node {
	var checkboxesNode = document.createElement('div')
	checkboxesNode.classList.add("filter_checkboxes")
	for (var i = 0; i < items.length; i++) {
		checkboxesNode.appendChild(createCheckbox(section, items[i].id.toString(), items[i].name, items[i].factionId))
	}
	return checkboxesNode
}

function getFilterItemsByShipType(factionId: XWing.FactionId): FilterItem[] {
	return xwing.availableShipTypes(factionId)
		.map((item: number) => xwing.lookupShipTypeMetadata(item))
		.map((ship: XWing.Json.ShipType) => new FilterItem(ship.id, ship.name, factionId))
		.sort((a: FilterItem, b: FilterItem) => a.name.replace(/<italic>/g, "").localeCompare(b.name.replace(/<italic>/g, "")))
}

function getFilterItemsByExtension(factionId: XWing.FactionId): FilterItem[] {
	return xwing.availableExtensions(factionId)
		.sort()
		.map((extensionId: number) => xwing.lookupExtension(extensionId))
		.map((extension: XWing.Json.Extension) => new FilterItem(extension.id, extension.name, factionId))
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

function createFiltersByFaction(factions: XWing.Json.Faction[], section: string, getFilterItems: any) {
	let filtersNode = document.createElement('div')
	for (var f = 0; f < factions.length; f++) {
		filtersNode.appendChild(createSubsectionTitle(factions[f].name))
		filtersNode.appendChild(createFilterCheckboxes(section, getFilterItems(factions[f].id)))
	}
	return filtersNode
}

function createFactionFilter(factions: XWing.Json.Faction[]): Node {
	var filterNode = document.createElement('div')
	var items: FilterItem[] = factions.map((faction: XWing.Json.Faction) => new FilterItem(faction.id, faction.name, faction.id))
	filterNode.classList.add("input_section")
	filterNode.appendChild(createSubsectionTitle("Factions"))
	filterNode.appendChild(createFilterCheckboxes("faction", items))
	return filterNode
}

function createCollapsibleInputSection(title: string, contentNode: any) {
	var sectionNode = document.createElement('div')
	var titleNode = document.createElement('div')
	sectionNode.classList.add("input_section")
	titleNode.classList.add("section_title")
	titleNode.innerHTML = "[+] "+ title
	titleNode.onclick = () => toggleVisibility(title, titleNode, contentNode)
	sectionNode.appendChild(titleNode)
	contentNode.classList.add("input_subsection")
	contentNode.style.display = "none"
	sectionNode.appendChild(contentNode)
	return sectionNode
}

function handleRadioButtonChange(radioButton: any) {
	if (radioButton.checked) {
		mainViewModel.setOption(radioButton.name, radioButton.value)
	}
}

function createRadioButton(key: string, value: string, label: string): Node {
	var labelNode = document.createElement('label')
	let inputNode = document.createElement('input')
	inputNode.type = "radio"
	inputNode.name = key
	inputNode.value = value
	inputNode.onchange = () => handleRadioButtonChange(inputNode)
	labelNode.appendChild(inputNode)
	labelNode.append(label)
	return labelNode
}

function createPageLayoutOptions(): Node {
	var radioButtons = document.createElement('div')
	radioButtons.appendChild(createRadioButton("page_layout", "landscape_85x11", '8.5"x11" Landscape'))
	radioButtons.appendChild(createRadioButton("page_layout", "landscape_11x17", '11"x17" Landscape'))
	return radioButtons
}

function createPrintOptions(): Node {
	var filterNode = document.createElement('div')
	filterNode.classList.add("input_section")
	filterNode.appendChild(createSubsectionTitle("Page Layout"))
	filterNode.appendChild(createPageLayoutOptions())
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
	filtersNode.appendChild(
		createCollapsibleInputSection("Entire Factions", createFactionFilter(factions)))
	filtersNode.appendChild(
		createCollapsibleInputSection("Ship Types",
			createFiltersByFaction(factions, "ship_type", getFilterItemsByShipType)))
	filtersNode.appendChild(
		createCollapsibleInputSection("Extensions (2nd ed. only)",
			createFiltersByFaction(factions, "extension", getFilterItemsByExtension)))
	filtersNode.appendChild(
		createCollapsibleInputSection("Print Options", createPrintOptions()))
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
