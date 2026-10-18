// ============================================================================
// N'KO NI LONKO — Outils du texte des articles (sans « use client »)
// ============================================================================
// Fonctions pures, utilisables par le serveur (CustomPortableText) ET par le navigateur
// (ArticleClient) : les importer d'ici n'envoie pas le moteur de rendu au navigateur.
// Déplacées depuis CustomPortableText.tsx le 18 octobre 2026, sans modification.
// ============================================================================

import type { PortableTextBlock } from "@portabletext/types";

export function toNkoDigits(num: number | string): string {
  const nkoDigits = ['߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉'];
  return num.toString().replace(/[0-9]/g, (w) => nkoDigits[+w]);
}

export function formatDateNko(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const frDate = `${day}/${month}/${year}`;
  return toNkoDigits(frDate);
}

export function isNko(text: string): boolean {
  if (!text) return false;
  return /[\u07C0-\u07FF]/.test(text);
}

export function getBlockText(value: PortableTextBlock): string {
  if (!value.children) return "";
  return (value.children as { text: string }[]).map((c) => c.text).join("");
}

export function estimateReadingTime(body: PortableTextBlock[]): number {
  if (!body) return 1;
  const text = body.map(block => getBlockText(block)).join(" ");
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200) || 1;
}
