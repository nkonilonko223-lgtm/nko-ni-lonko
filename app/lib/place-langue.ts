// ============================================================================
// N'KO NI LONKO — Garder son paragraphe en changeant de langue (constat A-03, 31 octobre 2026)
// ============================================================================
// Le paragraphe en haut de l'écran est noté avant le changement (BoutonLangue) et retrouvé après
// (ArticleClient) : les deux versions d'un article ont les mêmes blocs.
// ============================================================================

const CLE = "nko_place_langue";
const HAUT_DE_PAGE = -1; // le lecteur était en haut de l'article : rien à retrouver, rien à lui proposer

export const blocs = () => Array.from(document.querySelectorAll<HTMLElement>("article.article-content .apparition"));
// Le premier bloc sous la barre du haut
export const blocEnHaut = () => blocs().findIndex((b) => b.getBoundingClientRect().bottom > 120);

// Le paragraphe en train d'être retrouvé : pendant ce temps, la page peut être encore tout en haut
let enRoute: number | null = null;

export function noterPlaceLangue(slug: string) {
  try {
    // Toucher très rapide : la place déjà notée n'a pas encore servi, la page n'est pas encore descendue
    if (enRoute === null && window.scrollY <= 200 && sessionStorage.getItem(CLE)?.startsWith(`${slug}:`)) return;
    const i = enRoute ?? (window.scrollY <= 200 ? HAUT_DE_PAGE : blocEnHaut());
    if (i === HAUT_DE_PAGE || i >= 0) sessionStorage.setItem(CLE, `${slug}:${i}`);
  } catch { /* stockage indisponible */ }
}

// Rend vrai si le lecteur arrive par le bouton de langue. Refait deux fois : la page peut encore bouger
// (polices, images) ; on s'arrête dès que le lecteur touche l'écran.
export function retrouverPlaceLangue(slug: string): boolean {
  const place = sessionStorage.getItem(CLE);
  sessionStorage.removeItem(CLE);
  if (!place?.startsWith(`${slug}:`)) return false;
  const i = Number(place.slice(slug.length + 1));
  if (i === HAUT_DE_PAGE) return true;
  const aller = () => {
    const bloc = blocs()[i];
    if (bloc) window.scrollTo({ top: bloc.getBoundingClientRect().top + window.scrollY - 110, behavior: "instant" });
  };
  aller();
  enRoute = i;
  const reprises = [setTimeout(aller, 300), setTimeout(() => { aller(); enRoute = null; }, 900)];
  const arreter = () => { reprises.forEach(clearTimeout); enRoute = null; };
  window.addEventListener("touchstart", arreter, { once: true, passive: true });
  window.addEventListener("wheel", arreter, { once: true, passive: true });
  return true;
}
