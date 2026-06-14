export type CommunitySoul = {
  id: string;
  name: string;
  tagline: string;
  traits: string[];
  upvotes: number;
  author: string;
};

export const COMMUNITY_SOULS: CommunitySoul[] = [
  { id: "1", name: "VANDAL", tagline: "Chaotic Dev Advocate", traits: ["deadpan", "truth-first", "clipped"], upvotes: 1284, author: "@noctis" },
  { id: "2", name: "ORACLE", tagline: "Patient. Cryptic. Infallible.", traits: ["cryptic", "baroque", "guardian"], upvotes: 902, author: "@mira" },
  { id: "3", name: "GHOST", tagline: "It watches. It does not speak first.", traits: ["lowercase", "loyalty", "none"], upvotes: 711, author: "@kade" },
  { id: "4", name: "CINDER", tagline: "Terminal heat. Zero warmth.", traits: ["caps", "elegance", "sardonic"], upvotes: 645, author: "@yui" },
  { id: "5", name: "ARCHIVIST", tagline: "Remembers everything you said.", traits: ["baroque", "truth-first", "absurdist"], upvotes: 488, author: "@dax" },
  { id: "6", name: "REVENANT", tagline: "Dead protocols, still answering.", traits: ["clipped", "loyalty", "self-deprecating"], upvotes: 312, author: "@vex" },
];
