// ============================================================================
// N'KO NI LONKO — Garder son paragraphe en changeant de langue (constat A-03, 31 octobre 2026)
// ============================================================================
// Le paragraphe en haut de l'écran est noté avant le changement (BoutonLangue) et retrouvé après
// (ArticleClient) : les deux versions d'un article ont les mêmes blocs.
// ============================================================================

const CLE = "nko_place_langue";
const blocs = () => Array.from(document.querySelectorAll<HTMLElement>("article.article-content .apparition"));

export function noterPlaceLangue(slug: string) {
  if (window.scrollY <= 200) return; // en haut de l'article : rien à retrouver
  const i = blocs().findIndex((b) => b.getBoundingClientRect().bottom > 120);
  try {
    if (i >= 0) sessionStorage.setItem(CLE, `${slug}:${i}`);
  } catch { /* stockage indisponible */ }
}

// Rend vrai si le lecteur arrive par le bouton de langue. Refait deux fois : la page peut encore bouger
// (polices, images) ; on s'arrête dès que le lecteur touche l'écran.
export function retrouverPlaceLangue(slug: string): boolean {
  const place = sessionStorage.getItem(CLE);
  sessionStorage.removeItem(CLE);
  if (!place?.startsWith(`${slug}:`)) return false;
  const i = Number(place.slice(slug.length + 1));
  const aller = () => {
    const bloc = blocs()[i];
    if (bloc) window.scrollTo({ top: bloc.getBoundingClientRect().top + window.scrollY - 110, behavior: "instant" });
  };
  aller();
  const reprises = [setTimeout(aller, 300), setTimeout(aller, 900)];
  const arreter = () => reprises.forEach(clearTimeout);
  window.addEventListener("touchstart", arreter, { once: true, passive: true });
  window.addEventListener("wheel", arreter, { once: true, passive: true });
  return true;
}
