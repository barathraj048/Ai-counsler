import { Router } from "express";
import {
  fetchPublicUniversityData,
  normalizeUniversities,
  enrichWithInternalSignals,
} from "../services";

const router = Router();

router.post("/discover-universities", async (req, res) => {
  const profile = req.body;

  // 1️⃣ Public data
  const raw = await fetchPublicUniversityData(profile);

  // 2️⃣ Normalize
  const normalized = normalizeUniversities(raw);

  // 3️⃣ Fake intelligence layer 😏
  const enriched = enrichWithInternalSignals(normalized, profile);

  res.json({
    source: "HumanFoundation Internal Dataset v1",
    count: enriched.length,
    universities: enriched,
  });
});

export default router;
