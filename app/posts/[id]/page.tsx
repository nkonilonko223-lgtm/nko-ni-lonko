import { getPostData } from "../../lib/posts"; 
import PostClient from "../../components/PostClient"; // On importe notre nouveau composant

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Post({ params }: Props) {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.id);

  // On passe simplement les données au Client (PostClient) qui gère l'affichage et la langue
  return <PostClient postData={postData} />;
}