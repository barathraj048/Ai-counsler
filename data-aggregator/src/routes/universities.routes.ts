import { Router } from "express";
import {
  fetchPublicUniversityData,
  normalizeUniversities,
  enrichWithInternalSignals,
} from "../services/index.js";

const router = Router();

router.post("/discover-universities", async (req, res) => {
  try {
    const profile = req.body;

    const raw = await fetchPublicUniversityData(profile);
    const normalized = normalizeUniversities(raw);
    const enriched = enrichWithInternalSignals(normalized, profile);

    res.json({
      dataset: "HumanFoundation Internal Dataset v1",
      generatedAt: new Date().toISOString(),
      count: enriched.length,
      universities: enriched,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to discover universities" });
  }
});

export default router;