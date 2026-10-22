// ============================================================================
// N'KO NI LONKO — Images d'un article prêtes pour l'impression (23 octobre 2026)
// ============================================================================
// Les images du texte sont « paresseuses » : elles ne se chargent qu'en faisant défiler la page.
// À l'impression, celles qui n'étaient pas encore chargées sortaient en cadres vides.
// - demanderImagesArticle() : demande tout de suite toutes les images du texte ;
// - chargerImagesPourImpression() : les demande et attend qu'elles soient prêtes (6 s au plus),
//   pour le bouton « Imprimer » de la barre d'outils.
// ============================================================================

export function demanderImagesArticle(): HTMLImageElement[] {
  const images = [...document.querySelectorAll<HTMLImageElement>(".article-content img")];
  for (const image of images) if (image.loading === "lazy") image.loading = "eager";
  return images;
}

export async function chargerImagesPourImpression(delaiMax = 6000): Promise<void> {
  const enAttente = demanderImagesArticle().filter((image) => !image.complete);
  if (enAttente.length === 0) return;
  const chargee = (image: HTMLImageElement) =>
    new Promise<void>((pret) => {
      image.addEventListener("load", () => pret(), { once: true });
      image.addEventListener("error", () => pret(), { once: true });
    });
  await Promise.race([
    Promise.all(enAttente.map(chargee)),
    new Promise<void>((pret) => setTimeout(pret, delaiMax)),
  ]);
}
