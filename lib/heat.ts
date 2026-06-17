// Sequential color ramp for the participation heatmap.
// t in [0,1] -> [r,g,b]
const STOPS: [number, number[]][] = [
  [0, [22, 52, 59]],
  [0.18, [31, 111, 110]],
  [0.42, [43, 182, 168]],
  [0.7, [244, 185, 66]],
  [1, [255, 106, 61]],
];

export function heat(t: number): [number, number, number] {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0]) {
      const a = STOPS[i - 1];
      const b = STOPS[i];
      const f = (t - a[0]) / (b[0] - a[0]);
      return [0, 1, 2].map((k) =>
        Math.round(a[1][k] + (b[1][k] - a[1][k]) * f)
      ) as [number, number, number];
    }
  }
  const last = STOPS[STOPS.length - 1][1];
  return [last[0], last[1], last[2]];
}

export const nf = (n: number) => n.toLocaleString("nb-NO");
