// ============================================================================
// N'KO NI LONKO — Téléphones publiés (page Contact et données pour Google)
// ============================================================================
// Une seule source : changer ici seulement. Un numéro par pays, avec appel,
// WhatsApp et Telegram. Numéro au format international sans espaces (E.164)
// pour les liens, et avec espaces pour l'affichage.
// Les noms de pays en N'Ko viennent de la rédaction (vide = seul le français s'affiche).
// Décision du propriétaire (15 octobre 2026) : seulement sur la page Contact,
// pas dans le pied de page (numéros moins exposés aux robots).
// ============================================================================

export type Telephone = {
  e164: string;
  affichage: string;
  codePays: 'ML' | 'FR';
  pays: { nko: string; fr: string };
  whatsapp: boolean;
  telegram: boolean;
};

export const TELEPHONES: readonly Telephone[] = [
  { e164: '+22364055100', affichage: '+223 64 05 51 00', codePays: 'ML', pays: { nko: '', fr: 'Mali' }, whatsapp: true, telegram: true },
  { e164: '+33768610018', affichage: '+33 7 68 61 00 18', codePays: 'FR', pays: { nko: '', fr: 'France' }, whatsapp: true, telegram: true },
];

export const lienAppel = (t: Telephone) => `tel:${t.e164}`;
// WhatsApp : le numéro sans « + »
export const lienWhatsApp = (t: Telephone) => `https://wa.me/${t.e164.slice(1)}`;
// Telegram : fonctionne si « Qui peut me trouver par mon numéro » = « Tout le monde » dans Telegram
export const lienTelegram = (t: Telephone) => `https://t.me/${t.e164}`;
