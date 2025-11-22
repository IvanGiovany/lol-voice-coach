import React, { useEffect, useMemo, useState } from "react";
import NewsRail from "../components/NewsRail";

export type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

const roles: Role[] = ["Top", "Jungle", "Mid", "ADC", "Support"];

interface ChampionData {
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

const rolePreferredTags: Record<Role, string[]> = {
  Top: ["Fighter", "Tank"],
  Jungle: ["Fighter", "Assassin", "Tank"],
  Mid: ["Mage", "Assassin"],
  ADC: ["Marksman"],
  Support: ["Support", "Tank", "Mage"]
};

const countersForTag: Record<string, string[]> = {
  Assassin: ["Tank", "Support"],
  Fighter: ["Tank", "Mage"],
  Tank: ["Marksman", "Fighter"],
  Mage: ["Assassin", "Fighter"],
  Marksman: ["Tank", "Assassin"],
  Support: ["Mage", "Tank", "Support"]
};

// Static "meta" snapshot for sidebar (demo only)
const metaTopPicks: Array<{
  role: Role;
  champion: string;
  winrate: number;
  pickrate: number;
  tier: "S" | "A" | "B";
}> = [
  { role: "Top", champion: "Camille", winrate: 52.4, pickrate: 7.1, tier: "S" },
  { role: "Top", champion: "Darius", winrate: 51.8, pickrate: 10.3, tier: "S" },
  { role: "Jungle", champion: "Kha'Zix", winrate: 52.7, pickrate: 8.2, tier: "S" },
  { role: "Jungle", champion: "Amumu", winrate: 51.9, pickrate: 5.4, tier: "A" },
  { role: "Mid", champion: "Ahri", winrate: 52.1, pickrate: 9.5, tier: "S" },
  { role: "Mid", champion: "Annie", winrate: 51.6, pickrate: 4.3, tier: "A" },
  { role: "ADC", champion: "Jinx", winrate: 51.9, pickrate: 11.0, tier: "S" },
  { role: "ADC", champion: "Kai'Sa", winrate: 51.3, pickrate: 13.2, tier: "A" },
  { role: "Support", champion: "Lulu", winrate: 52.0, pickrate: 8.7, tier: "S" },
  { role: "Support", champion: "Nautilus", winrate: 51.4, pickrate: 9.1, tier: "A" }
];

// Improved heuristic scorer
function scoreChampionAsCounter(
  enemy: ChampionData,
  candidate: ChampionData,
  role: Role
): number {
  if (enemy.id === candidate.id) return -Infinity;

  const candidateTags = new Set(candidate.tags);

  const preferredRoleTags = new Set(rolePreferredTags[role]);
  const fitsLane = [...candidateTags].some((t) => preferredRoleTags.has(t));
  if (!fitsLane) return -Infinity;

  let score = 0;

  const desiredCounterTags = new Set<string>();
  enemy.tags.forEach((tag) => {
    const counters = countersForTag[tag];
    if (counters) counters.forEach((t) => desiredCounterTags.add(t));
  });

  if (desiredCounterTags.size === 0) {
    rolePreferredTags[role].forEach((t) => desiredCounterTags.add(t));
  }

  let classScore = 0;
  candidateTags.forEach((t) => {
    if (desiredCounterTags.has(t)) classScore += 1;
  });
  score += classScore * 1.2;

  const enemyRange = enemy.attackrange;
  const candRange = candidate.attackrange;

  const enemyIsMelee = enemyRange <= 200;
  const candIsMelee = candRange <= 200;
  const candIsRanged = candRange >= 450;
  const enemyIsRanged = enemyRange >= 475;

  if (enemyIsMelee && candIsRanged) {
    score += 0.8;
  }

  const candIsDiver =
    candidateTags.has("Assassin") || candidateTags.has("Fighter");
  if (enemyIsRanged && candIsMelee && candIsDiver) {
    score += 0.6;
  }

  if (candidate.difficulty <= 4) {
    score += 0.5;
  } else if (candidate.difficulty >= 8) {
    score -= 0.3;
  }

  if (candidate.tags.length > 1) {
    score += 0.2;
  }

  return score;
}

export default function MatchupsPage() {
  const [enemyChampionInput, setEnemyChampionInput] = useState("");
  const [role, setRole] = useState<Role>("Top");

  const [champions, setChampions] = useState<ChampionData[]>([]);
  const [patchVersion, setPatchVersion] = useState<string>("");
  const [loadingChamps, setLoadingChamps] = useState(true);
  const [champError, setChampError] = useState<string | null>(null);

  const [championInfo, setChampionInfo] = useState<ChampionData | null>(null);
  const [championError, setChampionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChamps() {
      try {
        setLoadingChamps(true);
        setChampError(null);

        const versionsRes = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        if (!versionsRes.ok) throw new Error("Failed to fetch versions");
        const versions = (await versionsRes.json()) as string[];
        const version = versions[0];
        setPatchVersion(version);

        const champsRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
        if (!champsRes.ok) throw new Error("Failed to fetch champion.json");
        const champsJson = (await champsRes.json()) as {
          data: Record<
            string,
            {
              id: string;
              name: string;
              title: string;
              tags: string[];
              info: { difficulty: number };
              stats: {
                hp: number;
                movespeed: number;
                attackdamage: number;
                attackspeed: number;
                attackrange: number;
              };
              image: { full: string };
            }
          >;
        };

        const champs: ChampionData[] = Object.values(champsJson.data).map((c) => ({
          id: c.id,
          name: c.name,
          title: c.title,
          tags: c.tags,
          difficulty: c.info.difficulty,
          hp: c.stats.hp,
          movespeed: c.stats.movespeed,
          attackdamage: c.stats.attackdamage,
          attackspeed: c.stats.attackspeed,
          attackrange: c.stats.attackrange,
          iconUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
          version
        }));

        setChampions(champs);
      } catch (err) {
        console.error("Error loading champions from Riot:", err);
        setChampError("Failed to load champion list from Riot.");
      } finally {
        setLoadingChamps(false);
      }
    }

    loadChamps();
  }, []);

  const enemyChampion: ChampionData | null = useMemo(() => {
    const term = enemyChampionInput.trim().toLowerCase();
    if (!term || champions.length === 0) return null;

    return (
      champions.find(
        (c) =>
          c.name.toLowerCase() === term ||
          c.id.toLowerCase() === term
      ) ??
      champions.find((c) => c.name.toLowerCase().includes(term)) ??
      null
    );
  }, [enemyChampionInput, champions]);

  useEffect(() => {
    if (!enemyChampion) {
      setChampionInfo(null);
      if (enemyChampionInput.trim()) {
        setChampionError("Could not match that name to a champion.");
      } else {
        setChampionError(null);
      }
      return;
    }
    setChampionError(null);
    setChampionInfo(enemyChampion);
  }, [enemyChampion, enemyChampionInput]);

  const recommendedCounters: ChampionData[] = useMemo(() => {
    if (!enemyChampion || champions.length === 0) return [];
    const scored = champions
      .map((c) => ({
        champ: c,
        score: scoreChampionAsCounter(enemyChampion, c, role)
      }))
      .filter((x) => x.score > -Infinity)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((x) => x.champ);
  }, [enemyChampion, champions, role]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!enemyChampion) {
      setChampionError("Could not match that name to a champion.");
    } else {
      setChampionError(null);
    }
  }

  return (
    <>
      {/* GRID: sidebar + main content */}
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 lg:items-start space-y-6 lg:space-y-0">
        {/* LEFT: meta sidebar (hidden on small screens) */}
        <aside className="hidden lg:flex lg:flex-col shrink-0 rounded-3xl border border-[#25293a] bg-[#05070c] shadow-[0_0_30px_rgba(15,23,42,0.6)] p-4 -ml-2">
          <h2 className="text-sm font-semibold text-gray-50 mb-1">
            Meta top picks by role
          </h2>
          <p className="text-[10px] text-gray-500 mb-3">
            Static demo snapshot. In a full version this would track live winrates
            by patch from aggregated match data.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {roles.map((r) => {
              const picks = metaTopPicks.filter((m) => m.role === r);
              if (picks.length === 0) return null;
              return (
                <div
                  key={r}
                  className="border-t border-[#25293a] pt-2 first:border-t-0 first:pt-0"
                >
                  <p className="text-[11px] font-semibold text-gray-200 mb-1">
                    {r}
                  </p>
                  <div className="space-y-1.5">
                    {picks.map((p, idx) => (
                      <div
                        key={p.champion + idx}
                        className="flex items-center justify-between rounded-lg bg-[#090d16] border border-[#262a3b] px-2 py-1.5"
                      >
                        <div>
                          <p className="text-[11px] text-gray-100">
                            {p.champion}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {p.tier}-tier • {p.pickrate.toFixed(1)}% pick
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-lime-300">
                            {p.winrate.toFixed(1)}%
                          </span>
                          <p className="text-[9px] text-gray-500">winrate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT: main dashboard + news */}
        <div className="space-y-6">
          {/* TOP BANNER */}
          <section className="rounded-3xl border border-[#25293a] bg-gradient-to-r from-[#11131b] via-[#0b1016] to-[#101316] shadow-[0_0_45px_rgba(15,23,42,0.6)] p-5 md:p-7 min-h-[260px]">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 border border-lime-400/40 px-3 py-1 text-[11px] text-lime-200">
                  <span>📊 Matchup Lab</span>
                  <span className="h-1 w-1 rounded-full bg-lime-400" />
                  <span>Draft &amp; lane prep dashboard</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-50">
                    Instantly see which champs fit this matchup for your role.
                  </h2>
                  <p className="text-xs md:text-sm text-gray-400 max-w-2xl">
                    Choose the enemy champion and your lane. We fetch champion data
                    from Riot and generate counter picks using class archetypes,
                    similar to how tools like blitz.gg reason about drafts.
                  </p>
                </div>

                {champError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {champError}
                  </div>
                )}

                <form
                  onSubmit={handleSearch}
                  className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto] items-end"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wide text-gray-400">
                      Enemy champion
                    </label>
                    <input
                      value={enemyChampionInput}
                      onChange={(e) => setEnemyChampionInput(e.target.value)}
                      placeholder={
                        loadingChamps
                          ? "Loading champions..."
                          : "e.g. Darius, Yasuo, Zed"
                      }
                      disabled={loadingChamps}
                      className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40 disabled:opacity-60"
                      list="champion-list"
                    />
                    <datalist id="champion-list">
                      {champions.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wide text-gray-400">
                      Your role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-lime-400 hover:bg-lime-300 px-5 py-2 text-xs font-semibold text-black disabled:bg-lime-700/40 disabled:text-gray-300 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(190,242,100,0.45)]"
                    disabled={loadingChamps}
                  >
                    {loadingChamps ? "Loading…" : "Analyse matchup"}
                  </button>
                </form>

                {enemyChampion && (
                  <p className="text-[11px] text-gray-500">
                    Matched champion:{" "}
                    <span className="font-semibold text-gray-100">
                      {enemyChampion.name}
                    </span>{" "}
                    ({enemyChampion.tags.join(", ")})
                  </p>
                )}

                {patchVersion && (
                  <p className="text-[10px] text-gray-500">
                    Riot Data Dragon patch: {patchVersion}
                  </p>
                )}
              </div>

              {/* Enemy overview */}
              <div className="w-full md:w-[290px]">
                <div className="rounded-2xl bg-[#05070c] border border-[#262a3b] shadow-inner shadow-black/40 p-4 h-full flex flex-col">
                  <h3 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Enemy champion overview
                  </h3>

                  {championError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 mb-2">
                      {championError}
                    </div>
                  )}

                  {championInfo ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={championInfo.iconUrl}
                          alt={championInfo.name}
                          className="h-14 w-14 rounded-2xl border border-[#262a3b] object-cover"
                        />
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-500">
                            Patch {championInfo.version}
                          </p>
                          <p className="text-sm font-semibold text-gray-100">
                            {championInfo.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {championInfo.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {championInfo.tags.join(" • ")} • Difficulty{" "}
                            <span className="font-semibold text-gray-200">
                              {championInfo.difficulty}/10
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-300">
                        <div>
                          <span className="text-gray-500">HP:</span>{" "}
                          <span className="font-mono text-gray-100">
                            {championInfo.hp}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">MS:</span>{" "}
                          <span className="font-mono text-gray-100">
                            {championInfo.movespeed}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">AD:</span>{" "}
                          <span className="font-mono text-gray-100">
                            {championInfo.attackdamage}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">AS:</span>{" "}
                          <span className="font-mono text-gray-100">
                            {championInfo.attackspeed.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Range:</span>{" "}
                          <span className="font-mono text-gray-100">
                            {championInfo.attackrange}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-gray-500 text-center">
                      Search for a champion to see their baseline stats and role
                      profile here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* COUNTERS */}
          <section className="rounded-3xl border border-[#25293a] bg-[#0b1016] shadow-[0_0_35px_rgba(15,23,42,0.6)] p-5 md:p-6 min-h-[260px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-50">
                Suggested counter picks
              </h2>
              {enemyChampion && (
                <p className="text-[11px] text-gray-500">
                  Role:{" "}
                  <span className="font-semibold text-gray-100">{role}</span>{" "}
                  • Targeting{" "}
                  <span className="font-semibold text-gray-100">
                    {enemyChampion.tags.join("/")}
                  </span>{" "}
                  archetype
                </p>
              )}
            </div>

            {!enemyChampion ? (
              <div className="rounded-2xl border border-dashed border-[#262a3b] bg-[#05070c] p-4 text-sm text-gray-500 flex items-center justify-center min-h-[180px]">
                Select an enemy champion and your role above to see suggested
                counter picks, similar to an esports analyst desk view.
              </div>
            ) : recommendedCounters.length === 0 ? (
              <div className="rounded-2xl border border-[#262a3b] bg-[#05070c] p-4 text-sm text-gray-400 min-h-[180px]">
                We couldn&apos;t find strong lane-appropriate counters using our class
                rules. In a full version, we&apos;d compute counter winrates from
                millions of match records per patch.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
                {recommendedCounters.map((c) => (
                  <article
                    key={c.id}
                    className="rounded-2xl border border-[#262a3b] bg-[#05070c] p-3 flex gap-3 items-center shadow-inner shadow-black/40"
                  >
                    <img
                      src={c.iconUrl}
                      alt={c.name}
                      className="h-12 w-12 rounded-xl border border-[#262a3b] object-cover"
                    />
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-100">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        {c.tags.join(" • ")}
                      </p>
                      {enemyChampion && (
                        <p className="text-[11px] text-gray-500">
                          Fits{" "}
                          <span className="font-semibold text-gray-200">
                            {role}
                          </span>{" "}
                          pool &amp; pressures{" "}
                          <span className="font-semibold text-gray-200">
                            {enemyChampion.tags.join("/")}
                          </span>{" "}
                          champions.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* NEWS under main content only */}
          <NewsRail />
        </div>
      </div>
    </>
  );
}
