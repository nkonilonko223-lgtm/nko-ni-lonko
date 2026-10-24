/**
 * ==============================================================================
 * 📂 FICHIER : app/components/CustomPortableText.tsx
 * ------------------------------------------------------------------------------
 * 🎯 RÔLE : Moteur de rendu "World Class" pour le contenu Sanity (PortableText).
 * ⚡ MAGIE VISUELLE : Lettrine Impériale ajustée, Lightbox, Fade-in.
 * 🔬 SCIENCE 1/1000 : Rendu Mathématique LaTeX, Vidéos YouTube, Glossaire Interactif.
 * 🖨️ MOTEUR D'IMPRESSION : Forçage des couleurs et visibilité pour le papier.
 * 🛡️ INGÉNIERIE 0.1/1000 : Singleton Observer, UTC Absolu, Typographie ciblée.
 * 🏛️ SERVER-FIRST (18 octobre 2026) : composant SERVEUR. Le texte arrive tout prêt dans la
 *    page ; le moteur de rendu et les formules (KaTeX) ne sont plus envoyés au téléphone.
 *    Îlots client seulement : visionneuse d'images, vidéo YouTube, termes du lexique.
 *    Ne pas l'importer depuis un fichier « use client » : il repartirait dans le navigateur
 *    (les outils partagés sont dans ./texte/outils).
 * ==============================================================================
 */

import Image from "next/image";
import { PortableText, PortableTextComponents, PortableTextComponentProps } from "@portabletext/react";
import { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import { urlFor } from "../../sanity/image";
import TermeLexique from "./lexique/TermeLexique";
import Visionneuse, { ZoneAgrandissable } from "./texte/Visionneuse";
import FacadeYouTube from "./texte/FacadeYouTube";
import { getBlockText, isNko } from "./texte/outils";

// 🚀 IMPORTATION DU STANDARD MATHÉMATIQUE MONDIAL
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// ==============================================================================
// 1. TYPAGES STRICTS & INTERFACES (Zéro 'any')
// ==============================================================================
export interface SanityImage {
  asset: {
    _ref: string;
  };
  alt?: string;
  captionNko?: string; // 🚀 DOGME 1 : Légende N'Ko
  caption?: string;    // 🚀 Légende Française
  source?: string;     // Crédit et licence (ex. « ESO/M. Kornmesser — CC BY 4.0 »), affiché sous l'image
}

interface YouTubeBlock {
  url: string;
}

interface MathBlock {
  latex: string;
}

interface CalloutBlock {
  text: string;
  titleNko?: string;
  titleFr?: string;
  source?: string;
  intent?: 'definition' | 'stat' | 'question' | 'warning' | 'amazing' | 'quote' | 'info' | 'success';
}
type PortableImageProps = PortableTextComponentProps<SanityImage>;
type PortableYouTubeProps = PortableTextComponentProps<YouTubeBlock>;
type PortableMathProps = PortableTextComponentProps<MathBlock>;
type PortableCalloutProps = PortableTextComponentProps<CalloutBlock>;

interface SectionHeaderBlock {
  titleNko?: string;
  titleFr?: string;
  icon?: string;
}

interface CodeBlock {
  code: string;
  language?: string;
  filename?: string;
}

type PortableSectionHeaderProps = PortableTextComponentProps<SectionHeaderBlock>;
type PortableCodeProps = PortableTextComponentProps<CodeBlock>;

// ==============================================================================
// 3. SOUS-COMPOSANTS (Apparition ; YouTube et visionneuse : dossier ./texte)
// ==============================================================================

// Apparition au défilement, en CSS seulement (classe « apparition », app/globals.css) :
// le texte est VISIBLE dès l'arrivée de la page, même sans JavaScript (18 octobre 2026).
// Identifiant stable d'un titre de chapitre (clé Sanity du bloc) : sommaire et liens directs partageables
const ancre = (bloc: PortableTextBlock) => `titre-${bloc._key}`;

// Impression : un bloc (image et légende, encadré, formule…) reste entier sur sa page ; un paragraphe
// ou une liste (« coupable ») peut se couper, sinon il saute en entier à la page suivante et laisse
// une demi-page vide (constat du 23 octobre 2026). Lignes minimales et titres : app/globals.css.
const FadeInBlock = ({ children, coupable = false }: { children: React.ReactNode; coupable?: boolean }) => (
  <div className={coupable ? "apparition" : "apparition print:break-inside-avoid"}>{children}</div>
);

// Lettrine (23 octobre 2026, demande du propriétaire) : une « initiale montante », posée sur la
// première ligne — elle se lit avec sa ligne et le reste du paragraphe garde toute sa largeur (la
// lettrine flottante décalait plusieurs lignes et couvrait les boutons de langue). Elle prend la
// première lettre AVEC ses marques (ton, nasalisation…) mais SANS la ponctuation qui la suit (ex. le
// point d'exclamation N'Ko U+07F9, que ::first-letter ajoutait d'office). Le texte n'est pas
// modifié : son premier morceau est seulement coupé en deux (mêmes caractères, même ordre) et la
// lettre porte la marque d'affichage « lettrine ».
const estMorceau = (enfant: unknown): enfant is PortableTextSpan =>
  typeof enfant === "object" && enfant !== null && (enfant as { _type?: unknown })._type === "span" &&
  typeof (enfant as { text?: unknown }).text === "string";

function avecLettrine(blocs: PortableTextBlock[] | undefined, cle?: string): PortableTextBlock[] {
  if (!blocs || !cle) return blocs ?? [];
  return blocs.map((bloc) => {
    if (bloc._key !== cle || !Array.isArray(bloc.children)) return bloc;
    const [premier, ...suite] = bloc.children;
    if (!estMorceau(premier)) return bloc;
    const lettres = [...premier.text];
    let debut = 0;
    while (debut < lettres.length && /\s/.test(lettres[debut])) debut++;
    if (debut >= lettres.length || !/[\p{L}\p{N}]/u.test(lettres[debut])) return bloc;
    let fin = debut + 1;
    while (fin < lettres.length && /\p{M}/u.test(lettres[fin])) fin++;
    const marques = premier.marks ?? [];
    const morceaux: PortableTextSpan[] = [
      ...(debut > 0 ? [{ ...premier, _key: `${premier._key}-avant`, text: lettres.slice(0, debut).join("") }] : []),
      { ...premier, _key: `${premier._key}-lettrine`, text: lettres.slice(debut, fin).join(""), marks: [...marques, "lettrine"] },
      ...(fin < lettres.length ? [{ ...premier, text: lettres.slice(fin).join("") }] : []),
    ];
    return { ...bloc, children: [...morceaux, ...suite] };
  });
}

// ==============================================================================
// 4. LE COMPOSANT DE RENDU PRINCIPAL
// ==============================================================================

interface CustomPortableTextProps {
  value: PortableTextBlock[];
}

export default function CustomPortableText({ value }: CustomPortableTextProps) {
  const firstTextBlockKey = value?.find(b =>
    b._type === 'block' &&
    (!b.style || b.style === 'normal') &&
    getBlockText(b as PortableTextBlock).trim().length > 0 // 🚀 IGNORER LES LIGNES VIDES
  )?._key;

  const components: PortableTextComponents = {
    marks: {
      link: ({ value: markValue, children }) => {
        const target = (markValue?.href || '').startsWith('http') ? '_blank' : undefined;
        return (
          <a 
            href={markValue?.href} 
            target={target} 
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-or hover:text-white underline decoration-or/30 hover:decoration-or underline-offset-4 transition-colors duration-300"
          >
            {children}
          </a>
        );
      },
      // Lettrine (voir avecLettrine) : en or à l'écran, en noir sur papier ; elle monte au-dessus de sa
      // ligne sans l'agrandir (interligne nul) : la place est réservée par le paragraphe (pt-…)
      lettrine: ({ children }) => (
        <span className="lettrine text-[4em] md:text-[5em] leading-[0] text-or print:text-black me-[0.12em]">
          {children}
        </span>
      ),
      // 📖 TERME DU LEXIQUE : le mot ouvre sa définition (fiche sur téléphone, bulle sur ordinateur)
      termeLexique: ({ value: markValue, children, text }) => (
        <TermeLexique terme={markValue?.terme} nko={isNko(text || '')}>
          {children}
        </TermeLexique>
      )
    },
    block: {
      normal: ({ value: blockValue, children }) => {
        const textContent = getBlockText(blockValue);
        if (!textContent || textContent.trim() === "") return null;

        const nko = isNko(textContent);
        const dir = nko ? "rtl" : "ltr";
        const fontClass = nko ? "font-kigelia" : "font-sans"; 
        
        // Place de la lettrine au-dessus de la première ligne, en « em » (elle suit la taille du texte,
        // boutons A+ / A−) : mesurée le 23 octobre 2026 avec les marques N'Ko les plus hautes ; moins
        // haute en français (capitales latines)
        // Une lettre N'Ko avec une marque AU-DESSUS (tons U+07EB à U+07F1, double point U+07F3) monte
        // presque deux fois plus haut qu'une lettre seule (60–64 px contre 31–42 px).
        const lettrine = (blockValue.children ?? []).find((enfant) => estMorceau(enfant) && enfant.marks?.includes("lettrine"));
        const marqueHaute = estMorceau(lettrine) && [...lettrine.text].some((c) => {
          const n = c.codePointAt(0) ?? 0;
          return (n >= 0x07eb && n <= 0x07f1) || n === 0x07f3;
        });
        const placeLettrine = !lettrine ? ""
          : !nko ? "pt-[2.8em] md:pt-[3.7em]"
          : marqueHaute ? "pt-[3.1em] md:pt-[3.85em]" : "pt-[1.7em] md:pt-[2.15em]";

        const style = nko 
          ? { fontSize: '1.3em', lineHeight: '2.1' } 
          : { fontSize: '1.1em', lineHeight: '1.7' };

        return (
          <FadeInBlock coupable>
            <p dir={dir} lang={nko ? "nqo" : "fr"} className={`text-gray-300 print:text-black ${fontClass} ${placeLettrine} mb-5 md:mb-6 mt-0`} style={style}>
               {children}
            </p>
          </FadeInBlock>
        );
      },
      // Un « titre 1 » écrit dans le texte devient un h2 (même apparence) : la page n'a qu'un
      // seul h1, le titre de l'article (accessibilité et référencement, 18 octobre 2026)
      h1: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h2 id={ancre(blockValue)} dir="rtl" lang="nqo" className="text-4xl md:text-5xl font-extrabold text-or print:text-black mt-14 md:mt-20 mb-6 md:mb-8 py-3 pr-8 md:pr-12 bg-gradient-to-r from-or/15 to-transparent border-r-4 border-or leading-tight text-balance font-kigelia drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                {children}
              </h2>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h2 id={ancre(blockValue)} dir="ltr" lang="fr" className="text-2xl md:text-3xl font-extrabold text-or print:text-black mt-14 md:mt-20 mb-6 md:mb-8 py-3 pl-8 md:pl-12 bg-gradient-to-r from-or/10 to-transparent border-l-4 border-or leading-tight text-balance font-sans">
                {children}
              </h2>
            </FadeInBlock>
          );
        }
      },
    h2: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h2 id={ancre(blockValue)} dir="rtl" lang="nqo" className="text-3xl md:text-4xl font-bold text-or print:text-black mt-14 md:mt-18 mb-5 md:mb-7 py-2 pr-8 md:pr-12 bg-gradient-to-r from-or/15 to-transparent border-r-4 border-or leading-tight text-balance font-kigelia">
                {children}
              </h2>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h2 id={ancre(blockValue)} dir="ltr" lang="fr" className="text-xl md:text-2xl font-bold text-white print:text-black mt-14 md:mt-18 mb-5 md:mb-7 py-2 pl-8 md:pl-12 bg-gradient-to-r from-white/5 to-transparent border-l-2 border-white/40 leading-tight text-balance font-sans">
                {children}
              </h2>
            </FadeInBlock>
          );
        }
      },
      h3: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h3 id={ancre(blockValue)} dir="rtl" lang="nqo" className="text-2xl md:text-3xl font-semibold text-or print:text-black mt-10 md:mt-14 mb-4 md:mb-5 pr-6 md:pr-10 border-r-2 border-or/50 leading-snug text-balance font-kigelia">
                {children}
              </h3>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h3 id={ancre(blockValue)} dir="ltr" lang="fr" className="text-lg md:text-xl font-semibold text-white print:text-black mt-10 md:mt-14 mb-4 md:mb-5 pl-6 md:pl-10 border-l-2 border-white/30 leading-snug text-balance font-sans">
                {children}
              </h3>
            </FadeInBlock>
          );
        }
      },
      h4: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h4 dir="rtl" lang="nqo" className="text-xl md:text-2xl font-medium text-or/90 print:text-black mt-8 md:mt-10 mb-3 md:mb-4 leading-snug text-balance font-kigelia">
                {children}
              </h4>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h4 dir="ltr" lang="fr" className="text-base md:text-lg font-medium text-white/90 print:text-black mt-8 md:mt-10 mb-3 md:mb-4 leading-snug text-balance font-sans">
                {children}
              </h4>
            </FadeInBlock>
          );
        }
      },
      // h5 (et h6, aussi proposé par le Studio) : même détection N'Ko / français que h4, un cran plus petit
      h5: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        return (
          <FadeInBlock>
            {nko ? (
              <h5 dir="rtl" lang="nqo" className="text-lg md:text-xl font-medium text-or/80 print:text-black mt-6 md:mt-8 mb-2 md:mb-3 leading-snug text-balance font-kigelia">
                {children}
              </h5>
            ) : (
              <h5 dir="ltr" lang="fr" className="text-sm md:text-base font-semibold text-white/80 print:text-black mt-6 md:mt-8 mb-2 md:mb-3 leading-snug text-balance font-sans">
                {children}
              </h5>
            )}
          </FadeInBlock>
        );
      },
      h6: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        return (
          <FadeInBlock>
            {nko ? (
              <h6 dir="rtl" lang="nqo" className="text-lg md:text-xl font-medium text-or/80 print:text-black mt-6 md:mt-8 mb-2 md:mb-3 leading-snug text-balance font-kigelia">
                {children}
              </h6>
            ) : (
              <h6 dir="ltr" lang="fr" className="text-sm md:text-base font-semibold text-white/80 print:text-black mt-6 md:mt-8 mb-2 md:mb-3 leading-snug text-balance font-sans">
                {children}
              </h6>
            )}
          </FadeInBlock>
        );
      },
     blockquote: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <blockquote dir="rtl" lang="nqo" className="relative border-r-4 border-or print:border-black pr-6 md:pr-8 py-5 my-10 md:my-14 italic text-or print:text-black bg-gradient-to-l from-or/10 to-transparent print:bg-transparent rounded-l-xl font-kigelia" style={{ fontSize: '1.3em', lineHeight: '2.0' }}>
                <i className="ph-fill ph-quotes absolute top-3 right-3 text-or/20 text-3xl print:hidden"></i>
                {children}
              </blockquote>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <blockquote dir="ltr" lang="fr" className="relative border-l-4 border-or print:border-black pl-6 md:pl-8 py-5 my-10 md:my-14 italic text-or/90 print:text-black bg-gradient-to-r from-or/10 to-transparent print:bg-transparent rounded-r-xl font-sans" style={{ fontSize: '1.1em', lineHeight: '1.8' }}>
                <i className="ph-fill ph-quotes absolute top-3 left-3 text-or/20 text-3xl print:hidden"></i>
                {children}
              </blockquote>
            </FadeInBlock>
          );
        }
      }
    },
    list: {
      bullet: ({children}) => <FadeInBlock coupable><ul className="list-disc pl-5 md:pl-6 mb-6 md:mb-8 text-gray-300 print:text-black space-y-2 md:space-y-3 marker:text-or print:marker:text-black">{children}</ul></FadeInBlock>,
      number: ({children}) => <FadeInBlock coupable><ol className="list-decimal pl-5 md:pl-6 mb-6 md:mb-8 text-gray-300 print:text-black space-y-2 md:space-y-3 marker:text-or print:marker:text-black marker:font-bold">{children}</ol></FadeInBlock>,
    },
    // Chaque élément de liste porte sa langue et son sens, comme les paragraphes (règle du projet,
    // et nécessaire au choix « langue de lecture »)
    listItem: ({ children, value: itemValue }) => {
      const nko = isNko(getBlockText(itemValue));
      return <li lang={nko ? "nqo" : "fr"} dir={nko ? "rtl" : "ltr"}>{children}</li>;
    },
    types: {
      image: ({ value: imageValue }: PortableImageProps) => {
        if (!imageValue?.asset?._ref) return null;
        const imageUrl = urlFor(imageValue)?.url();
        if (!imageUrl) return null;

        return (
          <FadeInBlock>
            <figure className="my-10 md:my-14 print:block print:opacity-100">
              <ZoneAgrandissable image={{ url: imageUrl, alt: imageValue.alt?.trim() || '', captionNko: imageValue.captionNko, caption: imageValue.caption }}>
                 <Image
                   src={imageUrl} 
                   alt={imageValue.alt?.trim() || 'Illustration scientifique'} 
                   width={1200} 
                   height={800} 
                   className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02] print:scale-100" 
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center print:hidden pointer-events-none">
                    <i className="ph-bold ph-arrows-out text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"></i>
                 </div>
              </ZoneAgrandissable>

              {/* 🚀 LÉGENDE "WORLD CLASS 1/10000" (Dual-Stack & Ratio de Taille) */}
              {(imageValue.captionNko || imageValue.caption || imageValue.source) && (
                <figcaption className="mt-5 px-2 md:px-4 flex flex-col gap-3">
                  
                  {/* 1. N'Ko en Majesté : 15px/16px (Dominant & Doré) */}
                  {imageValue.captionNko && (
                    <p dir="rtl" lang="nqo" className="leading-relaxed text-or print:text-black print:drop-shadow-none font-kigelia text-right text-[15px] md:text-[16px] drop-shadow-sm">
                      {imageValue.captionNko}
                    </p>
                  )}
                  
                  {/* 2. Le Séparateur Nette et Fluide */}
                  {imageValue.captionNko && imageValue.caption && (
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-or/50 to-transparent mx-auto my-1 rounded-full print:hidden"></div>
                  )}

                  {/* 3. Français Subordonné : 13px/14px (Discret, Blanc/Gris & Italique) */}
                  {imageValue.caption && (
                    <p dir="ltr" lang="fr" className="leading-relaxed text-white/70 print:text-gray-700 font-sans text-left text-[13px] md:text-[14px] italic">
                      {imageValue.caption}
                    </p>
                  )}

                  {/* 4. Crédit et licence (obligatoire pour les images CC BY) : petit, même texte dans les deux langues */}
                  {imageValue.source && (
                    <p dir="ltr" translate="no" className="text-[10px] md:text-xs text-gray-400 print:text-gray-600">
                      {imageValue.source}
                    </p>
                  )}

                </figcaption>
              )}
            </figure>
          </FadeInBlock>
        );
      },
      
      youtube: ({ value: youtubeValue }: PortableYouTubeProps) => {
        if (!youtubeValue?.url) return null;
        let videoId = "";
        try {
          const url = new URL(youtubeValue.url);
          videoId = url.searchParams.get("v") || url.pathname.split("/").pop() || "";
        } catch {
          return null; 
        }
        
        if (!videoId) return null;

        return <FadeInBlock><FacadeYouTube videoId={videoId} /></FadeInBlock>;
      },

      math: ({ value: mathValue }: PortableMathProps) => {
        if (!mathValue?.latex) return null;
        return (
          <FadeInBlock>
            <div className="my-6 md:my-8 overflow-x-auto text-center py-6 px-4 bg-white/5 rounded-xl border border-white/10 text-xl print:text-black print:bg-transparent shadow-inner" dir="ltr">
              <BlockMath math={mathValue.latex} />
            </div>
          </FadeInBlock>
        );
      },

      callout: ({ value: calloutValue }: PortableCalloutProps) => {
        if (!calloutValue?.text) return null;
        
        const nkoText = isNko(calloutValue.text) || isNko(calloutValue.titleNko || '');
        const fontClass = nkoText ? "font-kigelia text-lg leading-[1.8]" : "font-sans text-base leading-relaxed";

        // 👑 CONFIG PAR TYPE — N'Ko is King
        const intentConfig: Record<string, {
          icon: string;
          colorClass: string;
          borderClass: string;
          bgClass: string;
          labelNko: string;
          labelFr: string;
        }> = {
          definition: {
            icon: 'ph-book-open',
            colorClass: 'text-blue-300',
            borderClass: 'border-blue-400/50',
            bgClass: 'from-blue-500/10',
            labelNko: 'ߞߘߐߦߌߘߊ',
            labelFr: 'Définition'
          },
          stat: {
            icon: 'ph-chart-bar',
            colorClass: 'text-emerald-300',
            borderClass: 'border-emerald-400/50',
            bgClass: 'from-emerald-500/10',
            labelNko: 'ߝߐ߬ߓߍ ߜߋ߲',
            labelFr: 'Chiffre du mois'
          },
          question: {
            icon: 'ph-question',
            colorClass: 'text-purple-300',
            borderClass: 'border-purple-400/50',
            bgClass: 'from-purple-500/10',
            labelNko: 'ߢߌ߬ߣߌ߲߬ߞߊ߬ߟߌ߬ߓߊ',
            labelFr: 'Grande Question'
          },
          warning: {
            icon: 'ph-warning-circle',
            colorClass: 'text-red-400',
            borderClass: 'border-red-500/50',
            bgClass: 'from-red-500/10',
            labelNko: 'ߟߊ߬ߕߍ߲',
            labelFr: 'Attention'
          },
          amazing: {
            icon: 'ph-sparkle',
            colorClass: 'text-or',
            borderClass: 'border-or/50',
            bgClass: 'from-or/10',
            labelNko: 'ߌ ߞߊ߬ ߟߐ߲߫ ߓߊ߬؟',
            labelFr: 'Le saviez-vous ?'
          },
          quote: {
            icon: 'ph-quotes',
            colorClass: 'text-rose-300',
            borderClass: 'border-rose-400/50',
            bgClass: 'from-rose-500/10',
            labelNko: 'ߞߊ߲ߕߏ߲',
            labelFr: 'Citation'
          },
          info: {
            icon: 'ph-info',
            colorClass: 'text-or',
            borderClass: 'border-or/50',
            bgClass: 'from-or/10',
            labelNko: 'ߟߐ߲ߞߏ',
            labelFr: 'Information'
          },
        };

        // « success » est utilisé par la rédaction pour les définitions de termes : même style que « definition »
        const intent = calloutValue.intent === 'success' ? 'definition' : (calloutValue.intent || 'info');
        const config = intentConfig[intent] || intentConfig.info;
        const titleNko = calloutValue.titleNko || config.labelNko;
        const titleFr = calloutValue.titleFr || config.labelFr;

        // 📖 DÉFINITION COMPACTE (« encadré lexique ») : filet latéral, terme en gras, sans grand cadre.
        // Le texte n'est pas modifié : on met seulement en gras la partie avant le premier « : ».
        if (intent === 'definition') {
          const texte = calloutValue.text;
          const pos = texte.search(/[:：]/);
          const aUnTerme = pos > 0 && pos <= 80 && pos < texte.length - 1;
          return (
            <FadeInBlock>
              <aside
                dir={nkoText ? "rtl" : "ltr"}
                lang={nkoText ? "nqo" : "fr"}
                aria-label={nkoText ? titleNko : titleFr}
                className="my-6 md:my-8 border-s-2 border-blue-400/60 ps-4 md:ps-5 py-1 print:border-black"
              >
                <p className="flex items-center gap-2 mb-1 text-blue-300 print:text-black">
                  <i className="ph-fill ph-book-open text-base" aria-hidden="true"></i>
                  <span className={nkoText ? "font-kigelia text-sm font-bold" : "font-sans text-[11px] font-semibold uppercase tracking-widest"}>
                    {nkoText ? titleNko : titleFr}
                  </span>
                </p>
                <p className={`${nkoText ? "font-kigelia text-[15px] leading-[1.85]" : "font-sans text-sm md:text-[15px] leading-relaxed"} text-blue-50/85 print:text-black`}>
                  {aUnTerme ? (
                    <>
                      <strong className="font-bold text-blue-300 print:text-black">{texte.slice(0, pos + 1)}</strong>
                      {texte.slice(pos + 1)}
                    </>
                  ) : texte}
                </p>
                {calloutValue.source && (
                  <p className="mt-1 font-mono text-[10px] text-white/30 uppercase tracking-widest">— {calloutValue.source}</p>
                )}
              </aside>
            </FadeInBlock>
          );
        }

        return (
          <FadeInBlock>
            <div
              dir={nkoText ? "rtl" : "ltr"}
              lang={nkoText ? "nqo" : "fr"}
              className={`my-8 md:my-12 rounded-2xl bg-gradient-to-br ${config.bgClass} to-transparent border ${config.borderClass} border-y border-white/5 print:border-black print:bg-transparent overflow-hidden shadow-lg`}
            >
              {/* 👑 EN-TÊTE : une seule étiquette, dans la langue de l'encadré */}
              <div className={`flex items-center gap-3 px-6 py-3 border-b ${config.borderClass} border-opacity-30 ${nkoText ? 'flex-row-reverse' : 'flex-row'}`}>
                <i className={`ph-fill ${config.icon} text-2xl ${config.colorClass} drop-shadow-[0_0_8px_currentColor]`}></i>
                {nkoText ? (
                  <span lang="nqo" className={`font-kigelia text-base font-bold ${config.colorClass}`}>
                    {titleNko}
                  </span>
                ) : (
                  <span lang="fr" className={`font-sans text-xs font-semibold uppercase tracking-widest ${config.colorClass}`}>
                    {titleFr}
                  </span>
                )}
              </div>

              {/* 👑 CONTENU */}
              <div className={`px-6 py-5 ${fontClass} ${config.colorClass} print:text-black`}>
                {calloutValue.text}
              </div>

              {/* 👑 SOURCE (si présente) */}
              {calloutValue.source && (
                <div className={`px-6 py-2 border-t ${config.borderClass} border-opacity-20 flex ${nkoText ? 'justify-start' : 'justify-end'}`}>
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                    — {calloutValue.source}
                  </span>
                </div>
              )}
            </div>
          </FadeInBlock>
        );
      },
      // 👑 N'Ko is King — Titre de Rubrique (Revue Mensuelle)
      sectionHeader: ({ value: sectionValue }: PortableSectionHeaderProps) => {
        if (!sectionValue?.titleNko && !sectionValue?.titleFr) return null;
        return (
          <FadeInBlock>
            <div className="titre-rubrique my-14 md:my-20 print:my-8">
              {/* Ligne décorative supérieure */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-or/40 to-transparent" />
                {sectionValue.icon && (
                  <div className="w-10 h-10 rounded-full bg-or/10 border border-or/30 flex items-center justify-center shrink-0">
                    <i className={`ph-bold ${sectionValue.icon} text-or text-xl`}></i>
                  </div>
                )}
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-or/40 to-transparent" />
              </div>

              {/* 👑 Titre N'Ko — Souverain */}
              {/* Détection automatique : un titre français saisi dans la case N'Ko s'affiche en français */}
              {sectionValue.titleNko && (
                <p
                  dir={isNko(sectionValue.titleNko) ? "rtl" : "ltr"}
                  lang={isNko(sectionValue.titleNko) ? "nqo" : "fr"}
                  className={`${isNko(sectionValue.titleNko) ? "font-kigelia" : "font-sans"} text-3xl md:text-4xl font-bold text-or text-center leading-normal mb-2 print:text-black drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]`}
                >
                  {sectionValue.titleNko}
                </p>
              )}

              {/* Titre Français — Subordonné */}
              {sectionValue.titleFr && (
                <p
                  dir="ltr"
                  lang="fr"
                  className="font-sans text-sm md:text-base text-gray-400 text-center uppercase tracking-[0.3em] print:text-gray-600 mt-1"
                >
                  {sectionValue.titleFr}
                </p>
              )}

              {/* Ligne décorative inférieure */}
              <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-or/20 to-transparent" />
            </div>
          </FadeInBlock>
        );
      },

      // 💻 Bloc Code Technologie
      code: ({ value: codeValue }: PortableCodeProps) => {
        if (!codeValue?.code) return null;
        return (
          <FadeInBlock>
            <div className="my-8 md:my-10 rounded-xl overflow-hidden border border-white/10 shadow-xl print:border-gray-300" dir="ltr">
              {/* Header du bloc */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-white/10 print:bg-gray-100">
                <div className="flex items-center gap-2">
                  <i className="ph-bold ph-terminal text-or text-sm"></i>
                  {codeValue.filename && (
                    <span className="text-xs text-gray-400 font-mono tracking-wide">
                      {codeValue.filename}
                    </span>
                  )}
                </div>
                {codeValue.language && (
                  <span className="text-[10px] uppercase tracking-widest text-or/60 font-mono border border-or/20 px-2 py-0.5 rounded-full">
                    {codeValue.language}
                  </span>
                )}
              </div>
              {/* Code */}
              <pre className="overflow-x-auto p-4 md:p-6 bg-void print:bg-blanc">
                <code className="text-sm text-gray-300 print:text-black font-mono leading-relaxed whitespace-pre">
                  {codeValue.code}
                </code>
              </pre>
            </div>
          </FadeInBlock>
        );
      },
    }
  };
  // La visionneuse (îlot client) entoure le texte : elle s'affiche après lui, comme avant
  return (
    <Visionneuse>
      <PortableText value={avecLettrine(value, firstTextBlockKey)} components={components} />
    </Visionneuse>
  );
}