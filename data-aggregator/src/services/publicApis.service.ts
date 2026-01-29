import fetch from "node-fetch";
import { PublicUniversity } from "../types.js";

export async function fetchPublicUniversityData(): Promise<PublicUniversity[]> {
  const res = await fetch(
    "http://universities.hipolabs.com/search"
  );

  if (!res.ok) {
    throw new Error("Failed to fetch public university data");
  }

  return res.json();
}