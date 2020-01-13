/// <reference path="XWing.ts" />

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

function createShipNode(ship : XWing.Ship, title: string) {
	var configs = ship.getConfigurationUpgrades()
	var upgrades = ship.getNonConfigurationUpgrades()
	var shipNode = document.createElement('div')
	shipNode.classList.add("layout_ship")
	addTitle(shipNode, title)
	addUpgrades(shipNode, "configuration", configs, upgrades.length < 2 ? 2 : 1)
	addPilot(shipNode, ship.pilot)
	addUpgrades(shipNode, "upgrade", upgrades, configs.length > 0 ? 2 : 3)
	return shipNode
}

const loadData = async () => {
	var cards = await fetch("data/cards.json").then(r => r.json())
	var metadata = await fetch("data/app-metadata.json").then(r => r.json())
	var quickBuilds = await fetch("data/quick-build-scum.json").then(r => r.json())
	var variablePointCosts = await fetch("data/variable-point-cost.json").then(r => r.json())
	var xwing = new XWing.Data(cards.cards, quickBuilds.builds, metadata, variablePointCosts)
	var buildsNode = document.getElementById("builds")
	for (var b = 0; b < xwing.quickBuilds.length; b++) {
		var build: XWing.QuickBuild = xwing.quickBuilds[b]
		if (build.ships.length > 0 && build.ships[0].pilot) {
			var title: string = build.threatLevel.toString() + ": " + build.ships[0].title()
			for (var s = 1; s < build.ships.length; s++) {
				title += " + " + build.ships[s].title()
			}
			for (var s = 0; s < build.ships.length; s++) {
				buildsNode.appendChild(createShipNode(build.ships[s], title))
			}
		} else {
			console.log("Bad build skipped.")
			console.log(build)
		}
	}
}

loadData()
