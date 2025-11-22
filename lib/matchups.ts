export type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

export interface Matchup {
  enemyChampion: string;
  role: Role;
  goodPicks: string[];
  summary: string;
  tips: string[];
  coreItems: string[];
}

export const MATCHUPS: Matchup[] = [
  {
    enemyChampion: "Darius",
    role: "Top",
    goodPicks: ["Teemo", "Kayle", "Fiora"],
    summary: "Abuse range, kiting and scaling – never give him free all-ins.",
    tips: [
      "Stand behind minions so he can't easily hit multiple targets with Q.",
      "Short trades only – poke with autos/abilities then back off before he stacks passive.",
      "Track ghost/flash – if both are up, do not contest long lanes without jungle nearby.",
      "Freeze near your tower so he has to over-extend to trade."
    ],
    coreItems: ["Plated Steelcaps", "Early armor (Seeker's/Tabi)", "Anti-heal (Executioner's/BrambIe)"]
  },
  {
    enemyChampion: "Yasuo",
    role: "Mid",
    goodPicks: ["Lissandra", "Annie", "Malzahar"],
    summary: "Lock him down and punish his need to dash forward.",
    tips: [
      "Stand away from your melee minions so he can't dash through the wave to reach you.",
      "Track his passive shield and only commit to trades once it's popped.",
      "Ping when his windwall is down – that's your best window to all-in or call your jungler.",
      "Buy early stopwatch/Zhonya if you're the main engage target."
    ],
    coreItems: ["Seeker's Armguard/Zhonya's", "Plated Steelcaps", "Early HP (Rod/Everfrost)"]
  },
  {
    enemyChampion: "Zed",
    role: "Mid",
    goodPicks: ["Lissandra", "Kayle", "Malphite"],
    summary: "Survive his all-ins and outscale – armor and stasis are key.",
    tips: [
      "Respect level 6 – do not stand in the middle of the lane with no vision.",
      "Place control ward on one side and hug that side to limit his shadow angles.",
      "Buy early armor (Seeker's/Plated Steelcaps) and a stopwatch.",
      "Save your main CC for when he reappears from Death Mark."
    ],
    coreItems: ["Plated Steelcaps", "Seeker's -> Zhonya", "HP + armor mix"]
  },
  {
    enemyChampion: "Caitlyn",
    role: "ADC",
    goodPicks: ["Draven", "Jhin", "Ezreal"],
    summary: "Either out-range poke with skillshots or out-DPS her early.",
    tips: [
      "Do not stand near your low HP minions or she'll poke you while CSing.",
      "Avoid fighting in her traps and net range – wait for jungler or support engage.",
      "Shove when she bases – she has expensive item spikes and hates missing waves.",
      "If you're scaling, just farm safely and avoid 2v2s until you have items."
    ],
    coreItems: ["Berserker's Greaves", "Lifesteal (Vamp Scepter)", "Early sustain vs poke (Doran's Blade + pots)"]
  },
  {
    enemyChampion: "Blitzcrank",
    role: "Support",
    goodPicks: ["Morgana", "Nautilus", "Leona"],
    summary: "Punish his missed hooks and stand where hook is useless.",
    tips: [
      "Stand behind minions at all times – use them as a shield.",
      "Ward bushes early to remove fog-of-war hooks.",
      "If he misses hook, look for an aggressive trade while it's on cooldown.",
      "Do not group in tight spaces around objectives where he can fish for hooks."
    ],
    coreItems: ["Early Boots", "HP support items", "Situational QSS/Mikael's if they're all-in pick comp"]
  }
];

export function findMatchups(enemyChampion: string, role: Role): Matchup[] {
  const term = enemyChampion.trim().toLowerCase();
  return MATCHUPS.filter(
    (m) =>
      m.role === role &&
      m.enemyChampion.toLowerCase().includes(term)
  );
}
