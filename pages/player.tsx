import React, { useState } from "react";
import Layout from "../components/Layout";
import type { UserRegion } from "../lib/riotRegions";

interface SummonerDTO {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  summonerLevel: number;
}

interface RankedEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

interface MatchSummary {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  queueId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  lane: string;
  role: string;
  cs: number;
  goldEarned: number;
  kda: number;
}

interface PlayerResponse {
  summoner: SummonerDTO;
  ranked: RankedEntry[];
  matches: MatchSummary[];
}

const regions: { value: UserRegion; label: string }[] = [
  { value: "OCE", label: "OCE" },
  { value: "NA", label: "NA" },
  { value: "EUW", label: "EUW" },
  { value: "EUNE", label: "EUNE" },
  { value: "KR", label: "KR" },
  { value: "BR", label: "BR" },
  { value: "LAN", label: "LAN" },
  { value: "LAS", label: "LAS" },
  { value: "JP", label: "JP" },
  { value: "RU", label: "RU" },
  { value: "TR", label: "TR" }
];

function formatGameDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleString();
}

export default function PlayerPage() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState<UserRegion>("OCE");
  const [data, setData] = useState<PlayerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `/api/player?region=${region}&name=${encodeURIComponent(name.trim())}`
      );
      const json = await res.json();

      if (!res.ok) {
        setError(
            json.error ||
                json.detail ||
                'Failed to load player data (status ${res.status}).'
            
        );
        return;
      }

      setData(json as PlayerResponse);
    } catch (err) {
      console.error(err);
      setError("Unexpected error fetching player data.");
    } finally {
      setLoading(false);
    }
  }

  const soloRank =
    data?.ranked.find((r) => r.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexRank =
    data?.ranked.find((r) => r.queueType === "RANKED_FLEX_SR") ?? null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* TOP: search + profile */}
        <section className="rounded-3xl border border-[#25293a] bg-gradient-to-r from-[#11131b] via-[#0b1016] to-[#101316] shadow-[0_0_45px_rgba(15,23,42,0.6)] p-5 md:p-7">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch lg:justify-between">
            {/* Search and description */}
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 border border-lime-400/40 px-3 py-1 text-[11px] text-lime-200">
                <span>🔎 Player Tracker</span>
                <span className="h-1 w-1 rounded-full bg-lime-400" />
                <span>Mini OP.GG-style profile lookup</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-semibold text-gray-50">
                  Look up a summoner and see their recent ranked performance.
                </h2>
                <p className="text-xs md:text-sm text-gray-400 max-w-2xl">
                  Enter a summoner name and region. We query the public Riot API to
                  fetch their profile, ranked tier and a snapshot of their latest
                  games.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_auto] items-end"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wide text-gray-400">
                    Summoner name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Faker"
                    className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wide text-gray-400">
                    Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as UserRegion)}
                    className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40"
                  >
                    {regions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-lime-400 hover:bg-lime-300 px-5 py-2 text-xs font-semibold text-black disabled:bg-lime-700/40 disabled:text-gray-300 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(190,242,100,0.45)]"
                >
                  {loading ? "Searching…" : "Search"}
                </button>
              </form>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}
            </div>

            {/* Profile + ranks */}
            <div className="w-full lg:w-[320px]">
              <div className="rounded-2xl bg-[#05070c] border border-[#262a3b] shadow-inner shadow-black/40 p-4 h-full flex flex-col">
                <h3 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Profile & ranked snapshot
                </h3>

                {!data ? (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-gray-500 text-center">
                    Search for a summoner to see their profile and ranked tiers.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${data.summoner.profileIconId}.png`}
                        alt={data.summoner.name}
                        className="h-16 w-16 rounded-2xl border border-[#262a3b] object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-100">
                          {data.summoner.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Level {data.summoner.summonerLevel}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Region: {region}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="rounded-xl bg-[#0b1018] border border-[#262a3b] px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-gray-400">Ranked Solo/Duo</p>
                          <p className="text-gray-100 font-semibold">
                            {soloRank
                              ? `${soloRank.tier} ${soloRank.rank}`
                              : "Unranked"}
                          </p>
                        </div>
                        {soloRank && (
                          <div className="text-right text-gray-400">
                            <p>{soloRank.leaguePoints} LP</p>
                            <p>
                              {soloRank.wins}W / {soloRank.losses}L
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl bg-[#0b1018] border border-[#262a3b] px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-gray-400">Ranked Flex</p>
                          <p className="text-gray-100 font-semibold">
                            {flexRank
                              ? `${flexRank.tier} ${flexRank.rank}`
                              : "Unranked"}
                          </p>
                        </div>
                        {flexRank && (
                          <div className="text-right text-gray-400">
                            <p>{flexRank.leaguePoints} LP</p>
                            <p>
                              {flexRank.wins}W / {flexRank.losses}L
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM: recent matches */}
        <section className="rounded-3xl border border-[#25293a] bg-[#0b1016] shadow-[0_0_35px_rgba(15,23,42,0.6)] p-5 md:p-6 min-h-[260px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-semibold text-gray-50">
              Recent match history
            </h2>
            {data && (
              <p className="text-[11px] text-gray-500">
                Last {data.matches.length} games — development key limited snapshot,
                not full history.
              </p>
            )}
          </div>

          {!data ? (
            <div className="rounded-2xl border border-dashed border-[#262a3b] bg-[#05070c] p-4 text-sm text-gray-500 flex items-center justify-center min-h-[180px]">
              After searching, you&apos;ll see the player&apos;s last few games here with
              champion, KDA and basic lane info.
            </div>
          ) : data.matches.length === 0 ? (
            <div className="rounded-2xl border border-[#262a3b] bg-[#05070c] p-4 text-sm text-gray-400 min-h-[180px]">
              No recent games were returned by the Riot API for this account.
            </div>
          ) : (
            <div className="space-y-3">
              {data.matches.map((m) => (
                <article
                  key={m.matchId}
                  className={`rounded-2xl border px-3 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${
                    m.win
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-red-500/40 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#05070c] border border-white/10 flex items-center justify-center text-xs font-semibold text-gray-100">
                      {m.championName}
                    </div>
                    <div>
                      <p className="text-xs text-gray-200">
                        {m.win ? "Victory" : "Defeat"} ·{" "}
                        <span className="font-mono">
                          {m.kills}/{m.deaths}/{m.assists}
                        </span>{" "}
                        ({m.kda.toFixed(2)} KDA)
                      </p>
                      <p className="text-[11px] text-gray-300">
                        Mode: {m.gameMode} · Lane: {m.lane || "—"} · Role:{" "}
                        {m.role || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-gray-200 md:text-right">
                    <div>
                      <p className="text-gray-300 font-mono">{m.cs} CS</p>
                      <p className="text-gray-400">Gold: {m.goldEarned}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">
                        {formatGameDuration(m.gameDuration)}
                      </p>
                      <p className="text-gray-400">{formatDate(m.gameCreation)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
