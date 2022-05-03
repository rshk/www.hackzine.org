import ArrayTool from "../lib/array-tool";


const DEFAULT_STATE = {
    points: [],
};


export default function reducer(state = {}, action) {
    // console.log("REDUCER", state, action);
    switch (action.type) {

        case "@@INIT":
            return { ...DEFAULT_STATE, ...state };

        case "points.assign":
            return {
                ...state,
                points: action.points,
            };

        case "points.append":
            return {
                ...state,
                points: ArrayTool.append(state.points || [], action.newPoint),
            };

        case "points.remove":
            return {
                ...state,
                points: ArrayTool.remove(state.points || [], action.idx),
            };

        case "points.update":
            return {
                ...state,
                points: ArrayTool.update(state.points || [], action.idx, action.changes),
            };

        case "points.moveUp":
            return {
                ...state,
                points: ArrayTool.moveUp(state.points || [], action.idx),
            };

        case "points.moveDown":
            return {
                ...state,
                points: ArrayTool.moveDown(state.points || [], action.idx),
            };

        case "uiState.map.setCenter":
            return {
                ...state,
                uiState: {
                    ...state.uiState,
                    map: {
                        ...state.uiState?.map,
                        center: action.center,
                    },
                },
            };

        case "uiState.map.setZoom":
            return {
                ...state,
                uiState: {
                    ...state.uiState,
                    map: {
                        ...state.uiState?.map,
                        zoom: action.zoom,
                    },
                },
            };

        case "settings.update":
            return {
                ...state,
                settings: {
                    ...(state.settings || {}),
                    ...action.settings,
                },
            };

        default:
            return state;
    }
}
