import preSelect from './select';
import { assign } from 'lodash';

const Select = assign(
	preSelect.Layers,
	preSelect.TextLayers,
	preSelect.LayerTypes
);

export default (callback, context) => {

	let sketch    = context.api();
	let document  = sketch.selectedDocument;
	let selection = document.selectedLayers;

	let selectAllAtrboards = callback.SelectAllAtrboards;
	let selectOption       = callback.SelectOption;

	let count      = 0;

	selection.iterate(layer => {
		if (count > 0) return;
		selection.clear();
		let parentArtboard = (selectAllAtrboards)
			? selectArtboard(layer, 'isPage')
			: selectArtboard(layer, 'isArtboard');
		selectSubElement(parentArtboard, layer, selectOption)
		count++;
	});
	context.document.showMessage('🖱 Select Layers!');
}

function selectArtboard(layer, type) {
	let artboard = layer.container;
	if (artboard[type] === false) {
		return selectArtboard(artboard, type);
	}
	return artboard;
}

function selectSubElement(group, configLayer, selectOption) {
	if (group.isGroup || group.isArtboard) {
		group.iterate(layer => {
			selectSubElement(layer, configLayer, selectOption);
		});
	} else {
		let ifSelect = true;
		selectOption.forEach(fnName => {
			try {
				if (!Select[fnName](group.sketchObject, configLayer.sketchObject)) ifSelect = false;
			} catch (e) {
				ifSelect = false;
			}
		});
		if (ifSelect) {
			group.sketchObject.select_byExpandingSelection(true, true);
		}
	}
}