/** Mascots and icons cut from the brand sheet. Files live in /public/mascots (transparent PNG, native size). */
export const mascots = {
  "fluffy-scared": { w: 92, h: 114, alt: "Pink fluffy mascot, startled" },
  megaphone: { w: 108, h: 128, alt: "Orange mascot shouting into a megaphone" },
  flame: { w: 59, h: 79, alt: "Flame icon" },
  crowd: { w: 93, h: 79, alt: "Group of people icon" },
  "blue-wave": { w: 110, h: 114, alt: "Blue mascot waving" },
  "star-cool": { w: 125, h: 116, alt: "Pink star mascot wearing sunglasses" },
  "green-kiss": { w: 169, h: 129, alt: "Green mascot blowing a kiss" },
  eyes: { w: 122, h: 102, alt: "Pair of looking eyes" },
  "yellow-tongue": { w: 135, h: 115, alt: "Yellow mascot sticking its tongue out" },
  "heart-hug": { w: 112, h: 127, alt: "Orange heart mascot hugging itself" },
  "square-wave": { w: 156, h: 130, alt: "Pink square mascot waving" },
} as const;

export type MascotName = keyof typeof mascots;
