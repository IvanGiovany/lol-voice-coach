// pages/api/champions.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getChampionList } from "../../lib/riot";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await getChampionList();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Riot champions API error:", err);
    return res.status(500).json({ error: "Failed to fetch champion list." });
  }
}
