"use client";

// ✅ ON REMET LE "/studio" (C'est la bonne adresse)
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}