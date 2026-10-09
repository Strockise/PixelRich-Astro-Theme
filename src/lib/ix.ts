/**
 * Initial inline states written by Webflow for elements animated by its
 * interaction engine (public/js/webflow.js). The engine animates from these
 * values, so they must be identical to the original export.
 */
const transform = (value: string) =>
  ['-webkit-transform', '-moz-transform', '-ms-transform', 'transform']
    .map((prop) => `${prop}:translate3d(${value}) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)`)
    .join(';');

/** "Fade up" start state: 60px lower and transparent. */
export const HIDDEN_BELOW = `${transform('0, 60px, 0')};opacity:0`;
