# Random Civ Selection Groups
This small mod allows you to select a civ randomly from a smaller subset of civs instead of from the entire available list of civs. It is especially useful for mods such as Millennium A.D. and Aristeia that add civs from an entirely different place and time from the original game.

## How it works
Random selection groups are stored in json files under **simulation/data/settings/random_groups**. Each .json file contains the following information:

- Title: The name that will appear in the civ selection menu
- Tooltip: A brief description of the selection group
- Code: A short, lowercase code which the program will use to identify the selection group
- GUIOrder: A number that identifies where the selection group will appear in the selection menu. Lower numbers will appear higher.
- Weights: The list of civs to be selected from and the probability of selecting each one. Weights can be any number greater than zero. The probability of each civ being selected is determined by its weight as a percentage of the sum of weights. Using "*" will apply a default weight to all civs (subsequently setting a civ's weight to 0 will remove it from the selection).
- Color (optional): The color of text used in the selection menu. Defaults to the same color as Random.
- Disable (optional): If true, prevents the selection group from appearing in the selection menu.

By convention, the "Default" selection group (only civs from the original game) has a GUIOrder of 0, selection groups containing mostly original and Delenda Est civs have a GUIOrder of 1, and selection groups dependent on other mods have a GUIOrder of 2 or higher.

Selection groups containing less than two available civs are automatically filtered out of the selection menu.

## Examples

All African civs:

```json
{
	"Title": "African",
	"Code": "afr",
	"GUIOrder": 1,
	"Tooltip": "African civs.",
	"Weights": {
		"cart": 1,
		"kush": 1,
		"ptol": 1
	}
}
```

All civs except nomads (Scythians and Xiongnu):
```json
{
	"Title": "Non-Nomadic",
	"Code": "no_nomad",
	"GUIOrder": 1,
	"Tooltip": "Non-nomadic civs.",
	"Weights": {
		"*": 1,
		"scyth": 0,
		"xion": 0
	}
}
```

All civs from Millennium AD:
```json
{
	"Title": "Millennium A.D.",
	"Code": "millenniumad",
	"Color": "green",
	"GUIOrder": 2,
	"Tooltip": "Civs from Millennium A.D.",
	"Weights": {
		"anglo": 1,
		"byza": 1,
		"caro": 1,
		"norse": 1,
		"umay": 1
	}
}
```

## Support for other mods
Currently, selection groups are provided for most mods published on [0ad.mod.io](https://0ad.mod.io/), including:

- [Delenda Est](https://github.com/JustusAvramenko/delenda_est)
- [Terra Magna](https://github.com/0ADMods/terra_magna)
- [Millennium A.D.](https://github.com/0ADMods/millenniumad)
- [Aristeia](https://github.com/0ADMods/Aristeia)
- [Theban Greeks](https://github.com/0ADMods/theban_greeks)
- [Incas](https://0ad.mod.io/incas-0ad)
- [Mayas](https://0ad.mod.io/incas-0ad)

## Compatibility
Although this mod supports many other mods, it only requires basic 0ad.

This mod alters the following javascript files:

- gui/gamesetup/gamesetup.js
- gui/gamesetup/Pages/GameSetupPage/GameSettings/PerPlayer/Dropdowns/PlayerCiv.js
- gui/common/functions\_utility.js
- globalscripts/Templates.js

Any mod that also alters any of these files will likely be incompatible.

Maintained by hopeless-ponderer at [https://github.com/hopeless-ponderer/random\_civ\_groups\_0ad](https://github.com/hopeless-ponderer/random_civ_groups_0ad).
