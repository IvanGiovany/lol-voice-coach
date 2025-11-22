import type { NextApiRequest, NextApiResponse } from "next";
import { REGION_ROUTING, type UserRegion } from "../../lib/riotRegions";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) {
  console.warn("RIOT_API_KEY is not set in environment variables.");
}

async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY ?? ""
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Riot API error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const name = (req.query.name as string | undefined)?.trim();
  const region = req.query.region as UserRegion | undefined;

  if (!name || !region) {
    return res
      .status(400)
      .json({ error: "Missing 'name' or 'region' query parameter." });
  }

  const routing = REGION_ROUTING[region];
  if (!routing) {
    return res.status(400).json({ error: "Unsupported region." });
  }

  try {
    // 1) Summoner basic info
    const summoner = await riotFetch<{
      id: string;
      accountId: string;
      puuid: string;
      name: string;
      profileIconId: number;
      summonerLevel: number;
    }>(
      `https://${routing.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
        name
      )}`
    );

    // 2) Ranked info
    const ranked = await riotFetch<
      Array<{
        queueType: string;
        tier: string;
        rank: string;
        leaguePoints: number;
        wins: number;
        losses: number;
      }>
    >(
      `https://${routing.platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`
    );

    // 3) Recent match IDs (we'll grab last 5)
    const matchIds = await riotFetch<string[]>(
      `https://${routing.cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner.puuid}/ids?start=0&count=5`
    );

    // 4) Fetch each match summary (simplified)
    const matches = await Promise.all(
      matchIds.map(async (matchId) => {
        try {
          const match = await riotFetch<{
            metadata: { matchId: string };
            info: {
              gameDuration: number;
              gameMode: string;
              gameType: string;
              gameCreation: number;
              queueId: number;
              participants: Array<{
                puuid: string;
                championName: string;
                kills: number;
                deaths: number;
                assists: number;
                win: boolean;
                lane: string;
                role: string;
                summonerName: string;
                teamId: number;
                totalMinionsKilled: number;
                neutralMinionsKilled: number;
                goldEarned: number;
              }>;
            };
          }>(
            `https://${routing.cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`
          );

          const participant = match.info.participants.find(
            (p) => p.puuid === summoner.puuid
          );

          if (!participant) {
            throw new Error("Participant not found in match");
          }

          const cs =
            participant.totalMinionsKilled + participant.neutralMinionsKilled;
          const kda =
            participant.deaths === 0
              ? participant.kills + participant.assists
              : (participant.kills + participant.assists) / participant.deaths;

          return {
            matchId: match.metadata.matchId,
            gameCreation: match.info.gameCreation,
            gameDuration: match.info.gameDuration,
            gameMode: match.info.gameMode,
            queueId: match.info.queueId,
            championName: participant.championName,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            win: participant.win,
            lane: participant.lane,
            role: participant.role,
            cs,
            goldEarned: participant.goldEarned,
            kda
          };
        } catch (err) {
          console.error("Error fetching match", matchId, err);
          return null;
        }
      })
    );

    const filteredMatches = matches.filter((m) => m !== null);

    return res.status(200).json({
      summoner,
      ranked,
      matches: filteredMatches
    });
  } catch (err: any) {
    console.error("Player API error:", err);
    return res.status(500).json({
      error: "Failed to fetch data from Riot.",
      detail: err?.message ?? String(err)
    });
  }
}
