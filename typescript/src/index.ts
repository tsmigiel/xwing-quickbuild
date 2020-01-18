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

	shouldDisplayQuickBuild(build: XWing.QuickBuild) {
	    var shouldDisplayFaction: boolean = this.isChecked("faction", build.factionId.toString(), false)
	    var shouldDisplayShips: boolean = build.ships.reduce((acc: boolean, ship: XWing.Ship) => acc || this.shouldDisplayShip(ship), false)
		return shouldDisplayFaction && shouldDisplayShips
	} 

	shouldDisplayShip(ship: XWing.Ship){
		return this.isChecked("ship_type", ship.pilot.shipType.toString(), true)
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

function createShipNode(ships : XWing.Ship[], repeatTitle: boolean) {
	var gridTemplateColumns: string = ""
	var shipNode = document.createElement('div')
	shipNode.classList.add("layout_ship")
	for (var s = 0; s < ships.length; s++) {
		var configs = ships[s].getConfigurationUpgrades()
		var upgrades = ships[s].getNonConfigurationUpgrades()
		var size: LayoutSize = layoutSize(ships[s])
		if (s == 0 || repeatTitle) {
			addTitle(shipNode, ships[s].buildTitle)
			gridTemplateColumns += " auto"
		}
		if (configs.length > 0) {
			addUpgrades(shipNode, "configuration", configs, size.configWidth)
			gridTemplateColumns += " auto"
		}
		addPilot(shipNode, ships[s].pilot)
		gridTemplateColumns += " auto"
		if (upgrades.length > 0) {
			addUpgrades(shipNode, "upgrade", upgrades, size.nonConfigWidth)
			gridTemplateColumns += " auto"
		}
		shipNode.appendChild(document.createElement('div'))
		if (s == 0 || s < ships.length - 1) {
			gridTemplateColumns += " 1fr"
		}
	}
	shipNode.style.gridTemplateColumns = gridTemplateColumns
	return shipNode
}

function layoutSize(ship: XWing.Ship): LayoutSize {
	var numConfig = ship.getConfigurationUpgrades().length
	var numNonConfig = ship.getNonConfigurationUpgrades().length
	var configHeight = numConfig
	var configWidth = numConfig > 0 ? 1 : 0
	var nonConfigWidth = Math.min(3 - configWidth, Math.floor((numNonConfig + 1) / 2))
	var nonConfigHeight = Math.ceil(numNonConfig / nonConfigWidth)
	return {
		"width": configWidth + nonConfigWidth, "height": Math.max(configHeight, nonConfigHeight),
		"configWidth": configWidth, "configHeight": configHeight,
		"nonConfigWidth": nonConfigWidth, "nonConfigHeight": nonConfigHeight,
	}
}

function displayShips() {
	var builds: XWing.QuickBuild[] = []
	for (var b = 0; b < xwing.quickBuilds.length; b++) {
		var build: XWing.QuickBuild = xwing.quickBuilds[b]
		if (mainViewModel.shouldDisplayQuickBuild(build)) {
			builds.push(build)
		}
	}
	builds.sort((a: XWing.QuickBuild, b:XWing.QuickBuild) => layoutSize(b.ships[0]).height - layoutSize(a.ships[0]).height)
	var prevHeight = 0
	let buildsNode = document.getElementById("builds")
	buildsNode.innerHTML = ''
	for (var b = 0; b < builds.length; b++) {
		var size: LayoutSize = layoutSize(builds[b].ships[0])
		var height: number = size.height
		if (builds[b].ships.length == 1) {
			var ship: XWing.Ship = builds[b].ships[0]
			var shipNode: any
			if (ship.pilot.uniqueCount() > 0) {
				shipNode = createShipNode([ship], true)
			} else if (size.width == 0) {
				shipNode = createShipNode([ship, ship, ship], true)
			} else if (size.width == 1) {
				shipNode = createShipNode([ship, ship], true)
			} else {
				shipNode = createShipNode([ship], true)
			}
			if (prevHeight >= 3 && height < 3) {
				shipNode.style.pageBreakBefore = "always"
			}
			buildsNode.appendChild(shipNode)
		} else {
			var size1: LayoutSize = layoutSize(builds[b].ships[0])
			if (builds[b].ships.length == 2 && size.width + size1.width < 3) {
				height = Math.max(height, size1.height)
				shipNode = createShipNode([builds[b].ships[0], builds[b].ships[1]], false)
				if (prevHeight >= 3 && height < 3) {
					shipNode.style.pageBreakBefore = "always"
				}
				buildsNode.appendChild(shipNode)
			} else {
				for (var s = 0; s < builds[b].ships.length; s++) {
					shipNode = createShipNode([builds[b].ships[s]], true)
					height = layoutSize(builds[b].ships[s]).height
					if (prevHeight >= 3 && height < 3) {
						shipNode.style.pageBreakBefore = "always"
					}
					buildsNode.appendChild(shipNode)
					prevHeight = height
				}
			}
		}
		prevHeight = height
	}
}

function handleCheckboxChange(checkboxNode: any) {
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
