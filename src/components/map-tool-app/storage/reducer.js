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
                points: ArrayTool.append(state.points, action.newPoint),
            };

        case "points.remove":
            return {
                ...state,
                points: ArrayTool.remove(state.points, action.idx),
            };

        case "points.update":
            return {
                ...state,
                points: ArrayTool.update(state.points, action.idx, action.changes),
            };

        case "points.moveUp":
            return {
                ...state,
                points: ArrayTool.moveUp(state.points, action.idx),
            };

        case "points.moveDown":
            return {
                ...state,
                points: ArrayTool.moveDown(state.points, action.idx),
            };

        default:
            return state;
    }
}
