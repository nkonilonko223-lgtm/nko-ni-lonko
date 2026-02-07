import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// On définit le chemin vers le dossier "posts"
const postsDirectory = path.join(process.cwd(), 'posts');

// On définit la forme d'un article
export interface PostData {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  contentHtml?: string;
}

// Fonction 1 : Récupérer la liste de tous les articles (pour l'accueil)
export function getSortedPostsData(): PostData[] {
  // Obtenir les noms de fichiers sous /posts
  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames.map((fileName) => {
    // Enlever ".md" du nom de fichier pour avoir l'ID
    const id = fileName.replace(/\.md$/, '');

    // Lire le fichier markdown comme une chaîne de caractères
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Utiliser gray-matter pour analyser les métadonnées de l'article
    const matterResult = matter(fileContents);

    // Combiner les données avec l'id
    return {
      id,
      ...(matterResult.data as { title: string; date: string; category: string; image: string; excerpt: string }),
    };
  });

  // Trier les articles par date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// Fonction 2 : Récupérer UN SEUL article complet (avec le texte HTML)
// C'est celle-ci qui te manquait ou qui posait problème !
export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Utiliser gray-matter pour séparer métadonnées et contenu
  const matterResult = matter(fileContents);

  // Utiliser remark pour convertir le markdown en HTML
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Renvoyer les données combinées
  return {
    id,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; category: string; image: string; excerpt: string }),
  };
}