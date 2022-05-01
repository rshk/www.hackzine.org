/**
 * Immutable array manipulation tool
 */
const ArrayTool = {
    append(items, value) {
        return [ ...items, value ];
    },
    prepend(items, value) {
        return [ value, ...items ];
    },
    update(items, idx, value) {
        return [
            ...items.slice(0, idx),
            value,
            ...items.slice(idx + 1),
        ];
    },
    remove(items, idx) {
        return [
            ...items.slice(0, idx),
            ...items.slice(idx + 1),
        ];
    },
    moveUp(items, idx) {
        if (idx <= 0) {
            return items;
        }
        return [
            ...items.slice(0, idx - 1),
            items[idx],
            items[idx - 1],
            ...items.slice(idx + 1),
        ];
    },
    moveDown(items, idx) {
        if (idx >= (items.length - 1)) {
            return items;
        }
        return [
            ...items.slice(0, idx),
            items[idx + 1],
            items[idx],
            ...items.slice(idx + 2),
        ];
    },
};


export default ArrayTool;
