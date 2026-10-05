import { voice } from "./sfx";

/*
 * Sounds for the ticket rail (TicketRail). Both are scroll cues, so they stay silent until the
 * visitor has clicked once, like every other ambient sound on the site.
 */

/** The tap-in reader: two short high blips. */
export const beep = () =>
  voice((t, { tone }) => {
    tone(1900, t, 0.06, 0.035, "square");
    tone(1900, t + 0.1, 0.07, 0.035, "square");
  }, true);

/** The VERIFIED stamp landing: a low thump with a little paper slap on top. Kept short for scrubbing. */
export const stamp = () =>
  voice((t, { tone, noise }) => {
    tone(90, t, 0.12, 0.22, "sine", 60);
    noise(t, 0.07, 0.06, 1800, 500, 0.7);
  }, true);
