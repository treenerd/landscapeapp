// We will have all our actions in one file

// State Description (TODO: Add FLOW here!)
// data: null | { .. Data ... }
import settings from 'project/settings.yml';
import { loadData} from './api';
import { filtersToUrl } from '../utils/syncToUrl';
import _ from 'lodash';
import { push, replace } from 'connected-react-router';
import { zoomLevels } from '../utils/zoom';
import bus from './bus';
import { getItemsForExport } from '../utils/itemsCalculator';
import { getLandscapeCategories } from '../utils/sharedItemsCalculator';
import exportItems from '../utils/csvExporter';
import fields from '../types/fields';
import { findLandscapeSettings } from "../utils/landscapeSettings";


export const initialState = {
  data: null,
  ready: false,
  initialUrlHandled: false,
  filters: {
    relation: [],
    stars: null,
    license: [],
    marketCap: null,
    organization: [],
    headquarters: [],
    landscape: [],
    bestPracticeBadgeId: null,
    enduser: null,
    googlebot: null,
    language: undefined, // null means no language
    parents: [],
  },
  grouping: 'relation',
  sortField: 'name',
  sortDirection: 'asc',
  selectedItemId: null,
  mainContentMode: settings.big_picture.main.url, // also landscape or serverless for a big picture
  cardMode: 'card', // one of card, logo, flat, borderless
  filtersVisible: false,
  zoom: 1,
  isFullscreen: false
};

export function loadMainData() {
  return async function (dispatch) {
    const result = await loadData();
    dispatch(setData(result));
    dispatch(setReady(true));
  }
}

export function changeFilter(name, value) {
  return function(dispatch, getState) {
    dispatch(setFilter(name, value));

    // effect - set an url
    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function changeMainContentMode(mode) {
  return function(dispatch, getState) {
    dispatch(setMainContentMode(mode));
    // effect - set an url
    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function changeGrouping(value) {
  return function(dispatch, getState) {
    dispatch(setGrouping(value));

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}
export function changeSortField(value) {
  return function(dispatch, getState) {
    dispatch(setSortField(value));

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}
export function changeSortDirection(value) {
  return function(dispatch, getState) {
    dispatch(setSortDirection(value));

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function changeSortFieldAndDirection(value) {
  return function(dispatch, getState) {
    dispatch(setSortField(value.field));
    dispatch(setSortDirection(value.direction));

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function changeSelectedItemId(value) {
  return function(dispatch, getState) {
    dispatch(setSelectedItemId(value));

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));

  }
}

export function openSelectedItemIdInNewTab(value) {
  return function(dispatch, getState) {
    const state = {
      ...getState().main,
      selectedItemId: value
    }
    const url = filtersToUrl(state);
    window.open(url, '_blank');
  }
}

export function closeDialog() {
  return function(dispatch, getState) {
    dispatch(setSelectedItemId(null));

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function exportCsv() {
  return function(dispatch, getState) {
    // do the actual export here for now
    const state = getState();
    const items = getItemsForExport(state);
    exportItems(items);
  }
}


export function changeParameters(value) {
  return function(dispatch, getState) {
    const state = getState().main;
    if (!state.initialUrlHandled) {
      let newValue = {...value};
      // TODO: somehow use selectedItemCalculator here to detect if selected
      // item becomes null on a current tab
      if (state.ready === true && value.selectedItemId) {
        const mainContentMode = value.mainContentMode || state.mainContentMode;
        const item = _.find(state.data, {id: value.selectedItemId});
        if (mainContentMode !== 'card') {
          const landscapeSettings = findLandscapeSettings(mainContentMode);
          const landscape = fields.landscape.values;
          const categories = getLandscapeCategories({ landscapeSettings, landscape });
          const itemInCategories = _.find(categories, function(category) {
            return item && item.category === category.label;
          });
          if (!itemInCategories) {
            newValue.selectedItemId = null;
          }
        } else {
          if (!item) {
            newValue.selectedItemId = null;
          }
        }
      }
      dispatch(setParameters({...newValue}));
      const newState = getState().main;
      const url = filtersToUrl(newState);
      dispatch(replace(url));
      if (state.ready === true) {
        dispatch(markInitialUrlAsHandled());
      }
    } else {
      dispatch(setParameters({...value}));
    }
  }
}
export function resetParameters() {
  return function(dispatch) {
    dispatch(setParameters({...initialState, zoom: 1}));
    dispatch(push('/' + window.prefix));
    setTimeout(() => bus.emit('scrollToTop'), 1);
  }
}

export function resetFilters() {
  return function(dispatch, getState) {
    dispatch(setParameters({...getState().main, filters: initialState.filters, grouping: initialState.grouping, sortField: initialState.sortField}));
    dispatch(push(filtersToUrl(getState().main)));
    setTimeout(() => bus.emit('scrollToTop'), 1);
  }
}

export function makeZoomIn() {
  return function(dispatch, getState) {
    dispatch(zoomIn());

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function makeZoomOut() {
  return function(dispatch, getState) {
    dispatch(zoomOut());

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function makeZoomReset() {
  return function(dispatch, getState) {
    dispatch(zoomReset());

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function makeFullscreenEnabled() {
  return function(dispatch, getState) {
    dispatch(enableFullscreen());

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}

export function makeFullscreenDisabled() {
  return function(dispatch, getState) {
    dispatch(disableFullscreen());

    const state = getState().main;
    const url = filtersToUrl(state);
    dispatch(push(url));
  }
}


function markInitialUrlAsHandled() {
  return {
    type: 'Main/MarkInitialUrlAsHandled'
  };
}

function zoomIn() {
  return {
    type: 'Main/ZoomIn'
  };
}

function zoomOut() {
  return {
    type: 'Main/ZoomOut'
  };
}

function zoomReset() {
  return {
    type: 'Main/ZoomReset'
  };
}

export function enableFullscreen() {
  return {
    type: 'Main/EnableFullscreen'
  }
}

export function disableFullscreen() {
  return {
    type: 'Main/DisableFullscreen'
  }
}

export function showFilters() {
  return {
    type: 'Main/ShowFilters'
  };
}
export function hideFilters() {
  return {
    type: 'Main/HideFilters'
  };
}

function setData(data) {
  return {
    type: 'Main/SetData',
    data: data
  };
}
function setReady(value) {
  return {
    type: 'Main/SetReady',
    value: value
  };
}

function setFilter(name, value) {
  return {
    type: 'Main/SetFilter',
    name: name,
    value: value
  };
}
function setGrouping(value) {
  return {
    type: 'Main/SetGrouping',
    value: value
  };
}
function setSortField(value) {
  return {
    type: 'Main/SetSortField',
    value: value
  };
}
function setSortDirection(value) {
  return {
    type: 'Main/SetSortDirection',
    value: value
  };
}

function setParameters(value) {
  return {
    type: 'Main/SetParameters',
    value: value
  }
}

function setSelectedItemId(value) {
  return {
    type: 'Main/SetSelectedItemId',
    value: value
  }
}

function setMainContentMode(value) {
  return {
    type: 'Main/SetMainContentMode',
    value: value
  }
}

function markInitialUrlAsHandledHandler(state) {
  return { ...state, initialUrlHandled: true };
}

function setDataHandler(state, action) {
  return { ...state, data: action.data };
}
function setFilterHandler(state, action) {
  return { ...state, filters: {...state.filters, [action.name] : action.value } };
}
function setGroupingHandler(state, action) {
  return {...state, grouping: action.value };
}
function setSortFieldHandler(state, action) {
  return {...state, sortField: action.value };
}
function setSortDirectionHandler(state, action) {
  return {...state, sortDirection: action.value };
}
function setSelectedItemIdHandler(state, action) {
  return {...state, selectedItemId: action.value };
}
function setParametersHandler(state, action) {



  return {...state,
    filters: _.assign({}, initialState.filters, action.value.filters),
    grouping: action.value.grouping || initialState.grouping,
    sortField: action.value.sortField || initialState.sortField,
    sortDirection: action.value.sortDirection || initialState.sortDirection,
    selectedItemId: action.value.selectedItemId || initialState.selectedItemId,
    mainContentMode: action.value.mainContentMode || initialState.mainContentMode,
    cardMode: !_.isUndefined(action.value.cardMode) ? action.value.cardMode : state.cardMode,
    zoom: action.value.zoom  || state.zoom,
    isFullscreen: !_.isUndefined(action.value.isFullscreen) ? action.value.isFullscreen : state.isFullscreen
  };
}
function setReadyHandler(state, action) {
  return { ...state, ready: action.value };
}
function showFiltersHandler(state) {
  return {...state, filtersVisible: true};
}
function hideFiltersHandler(state) {
  return {...state, filtersVisible: false};
}

function setMainContentModeHandler(state, action) {
  return {...state, mainContentMode: action.value };
}

function zoomInHandler(state) {
  const zoom = state.zoom || 1.0;
  const index = zoomLevels.indexOf(zoom);
  const newZoom = zoomLevels[index + 1] || zoomLevels.slice(-1)[0];
  return {...state, zoom: newZoom };
}

function zoomOutHandler(state ) {
  const zoom = state.zoom || 1.0;
  const index = zoomLevels.indexOf(zoom);
  const newZoom = zoomLevels[index - 1] || zoomLevels[0];
  return {...state, zoom: newZoom };
}

function zoomResetHandler(state) {
  return {...state, zoom: 1.0 };
}

function enableFullscreenHandler(state) {
  return {...state, isFullscreen: true};
}
function disableFullscreenHandler(state) {
  return {...state, isFullscreen: false};
}

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'Main/SetData':
      return setDataHandler(state, action);
    case 'Main/SetFilter':
      return setFilterHandler(state, action);
    case 'Main/SetGrouping':
      return setGroupingHandler(state, action);
    case 'Main/SetSortField':
      return setSortFieldHandler(state, action);
    case 'Main/SetSortDirection':
      return setSortDirectionHandler(state, action);
    case 'Main/SetParameters':
      return setParametersHandler(state, action);
    case 'Main/SetSelectedItemId':
      return setSelectedItemIdHandler(state, action);
    case 'Main/SetReady':
      return setReadyHandler(state, action);
    case 'Main/ShowFilters':
      return showFiltersHandler(state, action);
    case 'Main/HideFilters':
      return hideFiltersHandler(state, action);
    case 'Main/SetMainContentMode':
      return setMainContentModeHandler(state, action);
    case 'Main/ZoomIn':
      return zoomInHandler(state, action);
    case 'Main/ZoomOut':
      return zoomOutHandler(state, action);
    case 'Main/ZoomReset':
      return zoomResetHandler(state, action);
    case 'Main/EnableFullscreen':
      return enableFullscreenHandler(state, action);
    case 'Main/DisableFullscreen':
      return disableFullscreenHandler(state, action);
    case 'Main/MarkInitialUrlAsHandled':
      return markInitialUrlAsHandledHandler(state, action);

    default:
      return state;
  }
}

export default reducer;
