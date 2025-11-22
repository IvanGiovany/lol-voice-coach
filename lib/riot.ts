// lib/riot.ts

export interface RiotChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  stats: {
    hp: number;
    movespeed: number;
    armor: number;
    attackdamage: number;
    attackspeed: number;
    attackrange: number;
    [key: string]: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

let cachedVersion: string | null = null;
let cachedChampions: RiotChampion[] | null = null;

async function getLatestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;

  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  if (!res.ok) {
    throw new Error("Failed to fetch Data Dragon versions");
  }
  const versions = (await res.json()) as string[];
  cachedVersion = versions[0]; // latest patch
  return cachedVersion;
}

export interface ChampionInfoDTO {
  id: string;
  name: string;
  title: string;
  tags: string[];
  difficulty: number;
  hp: number;
  movespeed: number;
  attackdamage: number;
  attackspeed: number;
  attackrange: number;
  iconUrl: string;
  version: string;
}

export interface ChampionListItem {
  id: string;
  name: string;
  tags: string[];
  iconUrl: string;
}

/**
 * Get full champion list once from Data Dragon and cache it in memory.
 */
async function getAllChampions(): Promise<{ version: string; champions: RiotChampion[] }> {
  const version = await getLatestVersion();
  if (cachedChampions) {
    return { version, champions: cachedChampions };
  }

  const listRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );

  if (!listRes.ok) {
    throw new Error("Failed to fetch champion list");
  }

  const listJson = (await listRes.json()) as {
    data: Record<string, RiotChampion>;
  };

  cachedChampions = Object.values(listJson.data);
  return { version, champions: cachedChampions };
}

/**
 * Look up a single champion by (approximate) name.
 */
export async function getChampionByName(
  name: string
): Promise<ChampionInfoDTO | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { version, champions } = await getAllChampions();
  const lower = trimmed.toLowerCase();

  // Exact name or id match first
  let champ =
    champions.find((c) => c.name.toLowerCase() === lower) ??
    champions.find((c) => c.id.toLowerCase() === lower);

  // Fallback: partial match
  if (!champ) {
    champ = champions.find((c) => c.name.toLowerCase().includes(lower));
  }

  if (!champ) return null;

  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image.full}`;

  return {
    id: champ.id,
    name: champ.name,
    title: champ.title,
    tags: champ.tags,
    difficulty: champ.info.difficulty,
    hp: champ.stats.hp,
    movespeed: champ.stats.movespeed,
    attackdamage: champ.stats.attackdamage,
    attackspeed: champ.stats.attackspeed,
    attackrange: champ.stats.attackrange,
    iconUrl,
    version
  };
}

/**
 * Slim list for dropdowns + counter logic.
 */
export async function getChampionList(): Promise<{
  version: string;
  champions: ChampionListItem[];
}> {
  const { version, champions } = await getAllChampions();

  return {
    version,
    champions: champions.map((c) => ({
      id: c.id,
      name: c.name,
      tags: c.tags,
      iconUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`
    }))
  };
}
