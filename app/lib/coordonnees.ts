// ============================================================================
// N'KO NI LONKO — Téléphones publiés (page Contact et données pour Google)
// ============================================================================
// Une seule source : changer ici seulement. Un numéro par pays (appel), WhatsApp
// sur le numéro de France seulement. Numéro au format international sans espaces
// (E.164) pour les liens, et avec espaces pour l'affichage.
// Les noms de pays en N'Ko viennent de la rédaction (16 octobre 2026), copiés sans modification.
// Décisions du propriétaire : numéros seulement sur la page Contact, jamais dans le
// pied de page ni « À propos » (15 octobre 2026) ; le moins de numéros possible :
// Telegram par nom d'utilisateur, WhatsApp sur le numéro de France (16 octobre 2026).
// ============================================================================

export type Telephone = {
  e164: string;
  affichage: string;
  codePays: 'ML' | 'FR';
  pays: { nko: string; fr: string };
  whatsapp: boolean;
};

export const TELEPHONES: readonly Telephone[] = [
  { e164: '+22364055100', affichage: '+223 64 05 51 00', codePays: 'ML', pays: { nko: 'ߡߊߟߌ߫', fr: 'Mali' }, whatsapp: false },
  { e164: '+33768610018', affichage: '+33 7 68 61 00 18', codePays: 'FR', pays: { nko: 'ߝߊ߬ߙߊ߲߬ߛߌ߫', fr: 'France' }, whatsapp: true },
];

export const lienAppel = (t: Telephone) => `tel:${t.e164}`;
// WhatsApp : le numéro sans « + ». Le nom d'utilisateur @NKonilonko (compte France) est
// seulement RÉSERVÉ chez WhatsApp : quand il sera actif, mettre son lien ici et sur les icônes.
export const lienWhatsApp = (t: Telephone) => `https://wa.me/${t.e164.slice(1)}`;

// Telegram : nom d'utilisateur du compte France, aucun numéro dans le lien
export const TELEGRAM = { nom: '@nkonilonko', lien: 'https://t.me/nkonilonko' } as const;

// Icône WhatsApp hors de la page Contact (pied de page, « À propos ») : la page Contact
export const LIEN_ICONE_WHATSAPP = '/contact';
