export type UserRegion =
  | "NA"
  | "EUW"
  | "EUNE"
  | "OCE"
  | "KR"
  | "BR"
  | "LAN"
  | "LAS"
  | "JP"
  | "RU"
  | "TR";

export interface RegionRouting {
  platform: string;
  cluster: string;
}

export const REGION_ROUTING: Record<UserRegion, RegionRouting> = {
  NA: { platform: "na1", cluster: "americas" },
  EUW: { platform: "euw1", cluster: "europe" },
  EUNE: { platform: "eun1", cluster: "europe" },
  OCE: { platform: "oc1", cluster: "sea" },
  KR: { platform: "kr", cluster: "asia" },
  BR: { platform: "br1", cluster: "americas" },
  LAN: { platform: "la1", cluster: "americas" },
  LAS: { platform: "la2", cluster: "americas" },
  JP: { platform: "jp1", cluster: "asia" },
  RU: { platform: "ru", cluster: "europe" },
  TR: { platform: "tr1", cluster: "europe" }
};
