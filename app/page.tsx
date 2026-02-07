import { getSortedPostsData } from "./lib/posts";
import HomeClient from "./components/HomeClient"; 

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main>
      <HomeClient posts={allPostsData} />
    </main>
  );
}