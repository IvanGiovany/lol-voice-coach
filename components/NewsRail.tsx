// components/NewsRail.tsx
import React from "react";

const newsItems = [
  {
    tag: "Patch Highlights",
    title: "Latest League of Legends Patch Notes",
    description:
      "Balance changes, item tuning and system updates straight from Riot’s game updates hub.",
    url: "https://www.leagueoflegends.com/en-au/news/game-updates/",
  },
  {
    tag: "Dev Blog",
    title: "League dev articles & deep dives",
    description:
      "Go behind the scenes with the team: design philosophies, mode updates and long-term roadmap talks.",
    url: "https://www.leagueoflegends.com/en-au/news/dev/",
  },
  {
    tag: "Esports",
    title: "LoL Esports news & tournaments",
    description:
      "Catch up on the latest from the pro scene: Worlds, regional leagues, rosters and more.",
    url: "https://lolesports.com/news",
  },
];

export default function NewsRail() {
  return (
    <section className="mt-6 rounded-3xl border border-[#25293a] bg-[#05070c] shadow-[0_0_30px_rgba(15,23,42,0.6)] p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-50">
            League news & meta snapshots
          </h2>
          <p className="text-[11px] text-gray-500">
            Curated links to official Riot news and esports pages for live
            updates.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {newsItems.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[#262a3b] bg-[#0b1016] p-3 flex flex-col justify-between min-h-[130px] hover:border-lime-400/70 hover:bg-[#0f1622] transition-colors"
          >
            <div className="space-y-1">
              <span className="inline-flex items-center rounded-full bg-lime-500/10 border border-lime-400/40 px-2 py-[2px] text-[10px] text-lime-200">
                {item.tag}
              </span>
              <h3 className="text-xs font-semibold text-gray-100">
                {item.title}
              </h3>
              <p className="text-[11px] text-gray-400">{item.description}</p>
            </div>
            <div className="mt-2 text-[11px] text-lime-300/80">
              View on official site &raquo;
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
