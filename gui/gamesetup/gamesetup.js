// TODO: Remove these globals by rewriting gamedescription.js
const g_MapSizes = prepareForDropdown(g_Settings && g_Settings.MapSizes);
const g_MapTypes = prepareForDropdown(g_Settings && g_Settings.MapTypes);
const g_PopulationCapacities = prepareForDropdown(g_Settings && g_Settings.PopulationCapacities);
const g_WorldPopulationCapacities = prepareForDropdown(g_Settings && g_Settings.WorldPopulationCapacities);
const g_StartingResources = prepareForDropdown(g_Settings && g_Settings.StartingResources);
const g_VictoryConditions = g_Settings && g_Settings.VictoryConditions;

/**
 * Offer users to select playable civs only.
 * Load unselectable civs as they could appear in scenario maps.
 */
const g_CivData = loadCivData(false, false);
const g_RandomCivGroups = deepfreeze(loadRandomCivGroups().map((group) => {
	if (group.Disable)
		return null;
	if (!group.Title || !group.Code) {
		error(sprintf('Random civ groups must have Title and Code; disabling %s (%s)', group.Title || 'undefined', group.Code || 'undefined'));
		return null;
	}
	let weights = {};
	// "*" signifies a standard weight to apply to all available civs; can be overridden later
	if (group.Weights.hasOwnProperty('*') && group.Weights['*'] !== 0) {
		let std_weight = group.Weights['*'];
		if (std_weight < 0) {
			error(sprintf('Random civ group weights must be >= 0 (got "*": %d); disabling %s', std_weight, group.Title));
			return null;
		}
		for (let civ in g_CivData) {
			if (g_CivData[civ].SelectableInGameSetup)
				weights[civ] = std_weight;
		}
	}
	for (let civ in group.Weights) {
		if (civ === '*')
			continue;
		if (group.Weights[civ] < 0) {
			error(sprintf('Random civ group weights must be >= 0 (got "%s": %d); disabling %s', civ, group.Weights[civ], group.Title));
			return null;
		}
		// this is where std weight overriding takes place, if applicable
		if (g_CivData.hasOwnProperty(civ) && g_CivData[civ].SelectableInGameSetup)
			weights[civ] = group.Weights[civ];
		if (weights[civ] === 0)
			delete weights[civ];
	}// end for civ
	// filter out any selection group with less than two available civs
	if (Object.keys(weights).length < 2)
		return null;
	if (!group.Tooltip)
		group.Tooltip = 'Random civ selection group';
	if (!group.hasOwnProperty('GUIOrder'))
		group.GUIOrder = 3;
	group.Weights = weights;
	return group;
}).filter((group) => group));

/**
 * Remembers which clients are assigned to which player slots and whether they are ready.
 * The keys are GUIDs or "local" in single-player.
 */
var g_PlayerAssignments = {};

/**
 * Holds the actual settings & related logic.
 * Global out of convenience in GUI controls.
 */
var g_GameSettings;

/**
 * Whether this is a single- or multiplayer match.
 */
const g_IsNetworked = Engine.HasNetClient();

/**
 * Is this user in control of game settings (i.e. is a network server, or offline player).
 */
const g_IsController = !g_IsNetworked || Engine.IsNetController();

/**
 * This instance owns all handlers that control
 * the two synchronized states g_GameSettings and g_PlayerAssignments.
 */
var g_SetupWindow;

// TODO: Remove these two global functions by specifying the JS class name in the XML of the GUI page.

function init(initData, hotloadData)
{
	g_SetupWindow = new SetupWindow(initData, hotloadData);
}

function getHotloadData()
{
	return g_SetupWindow.getHotloadData();
}
