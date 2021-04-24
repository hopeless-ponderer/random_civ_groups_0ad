PlayerSettingControls.PlayerCiv = class extends GameSettingControlDropdown
{
	constructor(...args)
	{
		super(...args);

		this.fixedCiv = undefined;
		this.values = prepareForDropdown(this.getItems());

		this.dropdown.list = this.values.name;
		this.dropdown.list_data = this.values.civ;
	}

	setControl()
	{
		this.label = Engine.GetGUIObjectByName("playerCivText[" + this.playerIndex + "]");
		this.dropdown = Engine.GetGUIObjectByName("playerCiv[" + this.playerIndex + "]");
	}

	onHoverChange()
	{
		this.dropdown.tooltip = this.values && this.values.tooltip[this.dropdown.hovered] || this.Tooltip;
	}

	onMapChange(mapData)
	{
		let mapPData = this.gameSettingsControl.getPlayerData(mapData, this.playerIndex);
		this.fixedCiv = mapPData && mapPData.Civ || undefined;
	}

	onAssignPlayer(source, target)
	{
		if (g_GameAttributes.mapType != "scenario" && source && target)
			[source.Civ, target.Civ] = [target.Civ, source.Civ];
	}

	onGameAttributesChange()
	{
		let pData = this.gameSettingsControl.getPlayerData(g_GameAttributes, this.playerIndex);
		if (!pData || !g_GameAttributes.mapType)
			return;

		if (this.fixedCiv)
		{
			if (!pData.Civ || this.fixedCiv != pData.Civ)
			{
				pData.Civ = this.fixedCiv;
				this.gameSettingsControl.updateGameAttributes();
			}
		}
		else if (this.values.civ.indexOf(pData.Civ || undefined) == -1)
		{
			pData.Civ =
				g_GameAttributes.mapType == "scenario" ?
					g_Settings.PlayerDefaults[this.playerIndex + 1].Civ :
					this.RandomCivId;

			if (pData.Civ === this.RandomCivId)
				pData.Random = true;

			this.gameSettingsControl.updateGameAttributes();
		}
	}

	onGameAttributesBatchChange()
	{
		let pData = this.gameSettingsControl.getPlayerData(g_GameAttributes, this.playerIndex);
		if (!pData || !g_GameAttributes.mapType)
			return;

		this.setEnabled(!this.fixedCiv);
		this.setSelectedValue(pData.Civ);
	}

	getItems()
	{
		let values = [];

		for (let civ in g_CivData)
			if (g_CivData[civ].SelectableInGameSetup)
				values.push({
					"name": g_CivData[civ].Name,
					"autocomplete": g_CivData[civ].Name,
					"tooltip": g_CivData[civ].History,
					"civ": civ,
					"random": false
				});

		values.sort(sortNameIgnoreCase);

		let random_civ_groups = g_RandomCivGroups.map((group) => ({
			'name': setStringTags('Random/' + group.Title,
				group.Color ? { "color": group.Color } : this.RandomItemTags),
			'civ': sprintf('random.%s', group.Code),
			'autocomplete': group.Title,
			'tooltip': group.Tooltip,
			'gui_order': group.GUIOrder,
			'random': true
		})).sort((a, b) => a.gui_order - b.gui_order);

		values.unshift(... random_civ_groups);

		values.unshift({
			"name": setStringTags(this.RandomCivCaption, this.RandomItemTags),
			"autocomplete": this.RandomCivCaption,
			"tooltip": this.RandomCivTooltip,
			"civ": this.RandomCivId,
			'random': true
		});

		return values;
	}

	getAutocompleteEntries()
	{
		return this.values.autocomplete;
	}

	onSelectionChange(itemIdx)
	{
		let pData = this.gameSettingsControl.getPlayerData(g_GameAttributes, this.playerIndex);
		pData.Civ = this.values.civ[itemIdx];
		pData.Random = this.values.random[itemIdx];
		this.gameSettingsControl.updateGameAttributes();
		this.gameSettingsControl.setNetworkGameAttributes();
	}

	onPickRandomItems()
	{
		let pData = this.gameSettingsControl.getPlayerData(g_GameAttributes, this.playerIndex);
		if (!pData || !pData.Random)
			return;

		let cultures = Object.keys(g_CivData).filter(civ => g_CivData[civ].SelectableInGameSetup).map(civ => g_CivData[civ].Culture);
		// Get a unique array of selectable cultures
		cultures = cultures.filter((culture, index) => cultures.indexOf(culture) === index);
		if (pData.Civ == this.RandomCivId)
		{
			// Pick a random civ of a random culture
			let culture = pickRandom(cultures);
			pData.Civ = pickRandom(Object.keys(g_CivData).filter(civ =>
				g_CivData[civ].Culture == culture && g_CivData[civ].SelectableInGameSetup));
		} else {
			let civGroupElems = pData.Civ.split('.');
			let groupId = civGroupElems[1] || undefined;
			let civWeights = undefined;
			for (let group of g_RandomCivGroups) {
				if (group.Code === groupId) {
					civWeights = group.Weights;
					break;
				}
			}// end for group
			if (!civWeights) {
				let culture = pickRandom(cultures);
				pData.Civ = pickRandom(Object.keys(g_CivData).filter(civ =>
					g_CivData[civ].Culture == culture && g_CivData[civ].SelectableInGameSetup));
			} else {
				let sumWeights = (() => {
					let val = 0;
					for (let key in civWeights)
						val += civWeights[key];
					return val;
				})();
				let choiceVal = sumWeights * Math.random();
				for (let civ in civWeights) {
					if (civWeights[civ] >= choiceVal) {
						pData.Civ = civ;
						break;
					}
					choiceVal -= civWeights[civ];
				}// end for civ
			}
		}

		pData.Random = false;
		this.gameSettingsControl.updateGameAttributes();
		this.gameSettingsControl.pickRandomItems();
	}
};

PlayerSettingControls.PlayerCiv.prototype.Tooltip =
	translate("Choose the civilization for this player.");

PlayerSettingControls.PlayerCiv.prototype.RandomCivCaption =
	translateWithContext("civilization", "Random");

PlayerSettingControls.PlayerCiv.prototype.RandomCivId =
	"random";

PlayerSettingControls.PlayerCiv.prototype.RandomCivTooltip =
	translate("Picks one civilization at random when the game starts.");

PlayerSettingControls.PlayerCiv.prototype.AutocompleteOrder = 90;
