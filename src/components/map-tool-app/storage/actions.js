export const points = {
    append: (newPoint) =>
        ({ type: "points.append", newPoint }),
    update: (idx, changes) =>
        ({ type: "points.update", idx, changes }),
    remove: (idx) =>
        ({ type: "points.remove", idx }),
    moveUp: (idx) =>
        ({ type: "points.moveUp", idx }),
    moveDown: (idx) =>
        ({ type: "points.moveDown", idx }),
    assign: (points) =>
        ({ type: "points.assign", points }),
};
