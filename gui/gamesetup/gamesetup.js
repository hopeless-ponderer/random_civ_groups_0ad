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
const g_RandomCivGroups = loadRandomCivGroups().map((group) => {
	if (group.Disable)
		return null;
	if (!group.Title || !group.Code) {
		error(sprintf('Random civ groups must have Title and Code; disabling %s (%s)', group.Title || 'undefined', group.Code || 'undefined'));
		return null;
	}
	if (!group.Code.split('').every((ch) => (ch >= 'a' && ch <= 'z') || ch === '_')) {
		error(sprintf('Random civ group Codes can only contain letters a-z and _; disabling %s (%s)', group.Title, group.Code));
		return null;
	}
	let weights = {};
	for (let civ in group.Weights) {
		if (group.Weights[civ] <= 0) {
			error(sprintf('Random civ group weights must be > 0 (got "%s": %d); disabling %s', civ, group.Weights[civ], group.Title));
			return null;
		}
		if (g_CivData.hasOwnProperty(civ) && g_CivData[civ].SelectableInGameSetup)
			weights[civ] = group.Weights[civ];
	}// end for civ
	if (Object.keys(weights).length < 2)
	{
		return null;
	}
	let filtered_group = {};
	for (let property in group) {
		if (property !== 'Weights')
			filtered_group[property] = group[property];
	}
	if (!filtered_group.Tooltip)
		filtered_group.Tooltip = 'Random civ selection group';
	if (!filtered_group.GUIOrder && filtered_group.GUIOrder !== 0)
		filtered_group.GUIOrder = 3;
	filtered_group.Weights = weights;
	return filtered_group;
}).filter((group) => group).map((() => {
	let group_codes = {};
	return (group) => {
		if (group_codes.hasOwnProperty(group.Code)) {
			group_codes[group.Code] += 1;
			group.Code = sprintf('%s_%d', group.Code, group_codes[group.Code]);
		} else {
			group_codes[group.Code] = 1;
		}
		return group;
	};
})());

/**
 * Whether this is a single- or multiplayer match.
 */
const g_IsNetworked = Engine.HasNetClient();

/**
 * Is this user in control of game settings (i.e. is a network server, or offline player).
 */
const g_IsController = !g_IsNetworked || Engine.HasNetServer();

/**
 * Central data storing all settings relevant to the map generation and simulation.
 */
var g_GameAttributes = {};

/**
 * Remembers which clients are assigned to which player slots and whether they are ready.
 * The keys are GUIDs or "local" in single-player.
 */
var g_PlayerAssignments = {};

/**
 * This instance owns all handlers that control the two synchronized states g_GameAttributes and g_PlayerAssignments.
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
