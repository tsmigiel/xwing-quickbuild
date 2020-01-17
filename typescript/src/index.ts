/// <reference path="XWing.ts" />

interface LayoutSize {
	width: number
	height: number
	configWidth: number
	configHeight: number
	nonConfigWidth: number
	nonConfigHeight: number
}

class MainViewModel {
	checkedCheckboxes: Map<string,Set<string>> = new Map()

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

function addUpgrades(shipNode: Node, baseClass: string, upgrades: XWing.Upgrade[], numColumns: number) {
	if (upgrades.length > 0) {
		var upgradeNode = document.createElement('div')
		upgradeNode.classList.add("layout_" + baseClass)
		upgradeNode.style.gridTemplateColumns = " auto".repeat(numColumns)
		for (var i = 0; i < upgrades.length; i++) {
			upgradeNode.appendChild(createUpgradeNode(upgrades[i], "card_" + baseClass + "_box", -(i+1)))
		}
		shipNode.appendChild(upgradeNode)
	}
}

function addPilot(shipNode: Node, pilot: XWing.Pilot) {
	var pilotNode = document.createElement('div')
	pilotNode.classList.add("layout_pilot")
	pilotNode.appendChild(createPilotNode(pilot))
	shipNode.appendChild(pilotNode)
}

function addTitle(shipNode: Node, title: string) {
	var titleNode  = document.createElement('div')
	var titleContent  = document.createElement('p')
	titleContent.classList.add("build_title")
	titleContent.innerHTML = title
	titleNode.classList.add("layout_title")
	titleNode.appendChild(titleContent)
	shipNode.appendChild(titleNode)
}

function createShipNode(ship : XWing.Ship) {
	var configs = ship.getConfigurationUpgrades()
	var upgrades = ship.getNonConfigurationUpgrades()
	var shipNode = document.createElement('div')
	shipNode.classList.add("layout_ship")
	addTitle(shipNode, ship.buildTitle)
	addUpgrades(shipNode, "configuration", configs, upgrades.length < 2 ? 2 : 1)
	addPilot(shipNode, ship.pilot)
	addUpgrades(shipNode, "upgrade", upgrades, configs.length > 0 ? 2 : 3)
	return shipNode
}

function layoutHeight(ship: XWing.Ship) {
	var numConfig = ship.getConfigurationUpgrades().length
	var numNonConfig = ship.getNonConfigurationUpgrades().length
	return numConfig + numNonConfig < 4 ? 1 : numConfig > 0 ? Math.max(numConfig, numNonConfig / 2) : numNonConfig / 3
}

function displayShips() {
	var ships: XWing.Ship[] = []
	for (var b = 0; b < xwing.quickBuilds.length; b++) {
		var build: XWing.QuickBuild = xwing.quickBuilds[b]
		if (mainViewModel.isChecked("faction", build.factionId.toString(), false)) {
			for (var s = 0; s < build.ships.length; s++) {
				if (mainViewModel.isChecked("ship_type", build.ships[s].pilot.shipType.toString(), true)) {
					ships.push(build.ships[s])
				}
			}
		}
	}
	console.log("sorting...")
	ships.sort((a: XWing.Ship, b:XWing.Ship) => layoutHeight(b) - layoutHeight(a))
	console.log("done")
	let buildsNode = document.getElementById("builds")
	buildsNode.innerHTML = ''
	for (var s = 0; s < ships.length; s++) {
		buildsNode.appendChild(createShipNode(ships[s]))
	}
}

function handleCheckboxChange(checkboxNode: any) {
	console.log(checkboxNode)
	if (checkboxNode.checked) {
		mainViewModel.select(checkboxNode.name, checkboxNode.value)
	} else {
		mainViewModel.deselect(checkboxNode.name, checkboxNode.value)
	}
}

function createFilter(key: string, value: string, label: string) {
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

function addFiltersToDom() {
	var filtersNode = document.getElementById("filters")
	let factionFilter = document.createElement('div')
	factionFilter.classList.add("filter_layout")
	xwing.availableFactions().forEach(function (item, index, array) {
		factionFilter.appendChild(createFilter("faction", item.toString(), xwing.lookupFactionMetadata(item).name))
	})
    filtersNode.appendChild(factionFilter)
	let shipTypeFilter = document.createElement('div')
	shipTypeFilter.classList.add("filter_layout")
	xwing.availableShipTypes()
		.map((item: number) => xwing.lookupShipTypeMetadata(item))
		.sort((a: XWing.Json.ShipType, b: XWing.Json.ShipType) => a.name.replace(/<italic>/g, "").localeCompare(b.name.replace(/<italic>/g, "")))
		.forEach(function (item, index, array) {
			shipTypeFilter.appendChild(createFilter("ship_type", item.id.toString(), item.name))
		})
    filtersNode.appendChild(shipTypeFilter)
	var inputNode = document.createElement('input')
	inputNode.type = "submit"
	inputNode.value = "Update"
	inputNode.onclick = displayShips
	filtersNode.appendChild(inputNode)
}

const loadData = async () => {
	var cards = await fetch("data/cards.json").then(r => r.json())
	var metadata = await fetch("data/app-metadata.json").then(r => r.json())
	var quickBuilds = [
		await fetch("data/quick-build-rebel.json").then(r => r.json()),
		await fetch("data/quick-build-empire.json").then(r => r.json()),
		await fetch("data/quick-build-scum.json").then(r => r.json())
	]
	var variablePointCosts = await fetch("data/variable-point-cost.json").then(r => r.json())
	xwing = new XWing.Data(cards.cards, quickBuilds, metadata, variablePointCosts)
	addFiltersToDom()
	displayShips()
}

loadData()
