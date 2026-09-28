// An actual keyboard route, in 60 Hz frames. No teleporting or world edits.
export const EXPEDITION_ROUTE = [
  [60, { axis: 1 }], [24, { jump: true }], [24, { axis: -1 }], [25, {}],
  [1, { jump: true }], [104, { axis: 1 }], [20, {}], [40, { axis: -1 }],
  [24, { jump: true }], [30, { axis: -1 }], [30, {}], [12, { axis: -1 }],
  [24, { jump: true }], [57, { axis: -1 }], [30, {}], [28, { axis: 1 }],
  [1, { jump: true }], [55, { axis: 1 }], [20, {}], [26, { axis: 1 }],
  [18, { jump: true }], [44, { axis: 1 }], [20, {}],
  [180, { axis: -1 }], [150, {}], [26, { axis: 1 }], [20, {}],
];
