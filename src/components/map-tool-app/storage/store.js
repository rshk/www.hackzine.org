import { applyMiddleware, createStore } from "redux";
import { save, load } from "redux-localstorage-simple";
import reducer from "./reducer";


const LOCALSTORAGE_CONFIG = {
    states: ['points'],
    namespace: 'hackzine-map-tool',
    namespaceSeparator: ':',
};


const createStoreWithMiddleware = applyMiddleware(
    // Save to localStorage from middleware
    save({
        ...LOCALSTORAGE_CONFIG,
        // ignoreStates
        // debounce: 500,
        // disableWarnings: false,
    }),
)(createStore);

const store = createStoreWithMiddleware(
    reducer,

    // Load initial state from localstorage
    load({
        ...LOCALSTORAGE_CONFIG,
        // preloadedState
        // disableWarnings
    }),

    // Enable React DevTools integration
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
