import { db } from "./firebase";
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, limit } from "firebase/firestore";

export interface CommunityPost {
  id: string;
  author: string;
  authorId?: string;
  avatar: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  type: "sheet" | "post" | "question";
  createdAt: any;
}

const COLLECTION_NAME = "community_posts";

export const getCommunityPosts = async (): Promise<CommunityPost[]> => {
  const postsRef = collection(db, COLLECTION_NAME);
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(50));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      author: data.author,
      authorId: data.authorId,
      avatar: data.avatar,
      content: data.content,
      tags: data.tags || [],
      likes: data.likes || 0,
      comments: data.comments || 0,
      type: data.type,
      createdAt: data.createdAt
    } as CommunityPost;
  });
};

export const addCommunityPost = async (post: Omit<CommunityPost, "id" | "createdAt" | "likes" | "comments">) => {
  const postsRef = collection(db, COLLECTION_NAME);
  const newPostRef = await addDoc(postsRef, {
    ...post,
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp()
  });
  return newPostRef.id;
};

export const likePost = async (postId: string) => {
  const postRef = doc(db, COLLECTION_NAME, postId);
  await updateDoc(postRef, {
    likes: increment(1)
  });
};

// Seeding function (run once if empty)
export const seedCommunityPosts = async () => {
  const postsRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(query(postsRef, limit(1)));
  if (!snapshot.empty) return; // already seeded
  
  const seedData = [
    { author: "น้องส้ม โอ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Som", content: "แจกสรุปชีทเรียน Data Structures บทที่ 4-5 สรุปให้แล้วแบบเข้าใจง่าย ควรอ่านก่อนสอบมิดเทอมจ้า\n\n### สิ่งที่สรุปไว้มี\n- Arrays & Linked Lists\n- Stacks & Queues\n- Trees & Graphs\n- Hashing\n\n```js\nconst struct = new Array();\n```", tags: ["Data Structure", "สรุปสอบ", "Year 2"], likes: 45, type: "sheet" },
    { author: "พี่เอก วิศวะ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eak", content: "ใครกำลังหาเพื่อนทำโปรเจกต์ AI/ML พรุ่งนี้เจอกันที่ตึกสมาร์ทนะ ขาดคนทำ Frontend 1 ตำแหน่ง 🚀\n\n> ใช้ React กับ Tailwind CSS เป็นหลัก", tags: ["หาทีม", "AI/ML", "Frontend"], likes: 18, type: "post" },
    { author: "Ploy CS", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ploy", content: "รวมสูตร Calculus 2 ที่ชอบออกสอบบ่อยๆ พร้อมตัวอย่างโจทย์ 📝", tags: ["Calculus", "แจกชีท"], likes: 120, type: "sheet" },
    { author: "Krit", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Krit", content: "มีใครสนใจเข้าฟังบรรยาย AI Prompt Engineering ของมหาลัยพรุ่งนี้บ้าง ไปด้วยกันมั้ย\n\n- How to talk to AI\n- Chain of thoughts\n- RAG Pipelines", tags: ["AI", "Event"], likes: 11, type: "post" },
    { author: "Mew UX/UI", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mew", content: "แนะนำ font ฟรีสวยๆ ไว้ทำงานออกแบบส่งอาจารย์ โหลดเก็บไว้เลย!\n\n1. **Noto Sans Thai**\n2. **Prompt**\n3. **Kanit**\n\nทั้งหมดจาก Google Fonts จ้า", tags: ["Design", "Tools"], likes: 55, type: "post" },
    { author: "KenDev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ken", content: "สอบมิดเทอมวิชา Algorithm ยากมาก ใครพอมีแนวข้อสอบปีที่แล้วบ้างครับ?", tags: ["Algorithm", "ถาม-ตอบ"], likes: 12, type: "question" },
  ];

  for (const post of seedData) {
    await addDoc(postsRef, {
      ...post,
      comments: Math.floor(Math.random() * 20),
      createdAt: serverTimestamp()
    });
  }
};