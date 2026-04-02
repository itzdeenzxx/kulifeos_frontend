import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "@/hooks/useAuth";

// Generic hook to fetch a document
export function useFirestoreDoc<T>(collectionName: string, docId?: string, defaultState: T | null = null) {
  const [data, setData] = useState<T | null>(defaultState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        }
      } catch (err) {
        console.error(`Error fetching ${collectionName}/${docId}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [collectionName, docId]);

  return { data, loading };
}

// Generic hook to fetch a collection
export function useFirestoreCollection<T>(collectionName: string, queryConstraints: any[] = [], defaultState: T[] = []) {
  const [data, setData] = useState<T[]>(defaultState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const q = query(collection(db, collectionName), ...queryConstraints);
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as unknown as T);
        if (items.length > 0) {
          setData(items);
        }
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading };
}

// Default Fallback States
const defaultUserProfile = {
  name: "New Student", faculty: "Unknown Faculty", year: "1st Year", avatar: "NS", bio: "Welcome to KULifeOS!"
};

const defaultCareerRecommendation = {
  title: "Exploring Careers", matchScore: 0, description: "Add more skills to get personalized recommendations.", requiredSkills: []
};

export interface TaskItem { id: string; title: string; description?: string; status: "todo" | "inProgress" | "done"; assignee: string; tags: string[]; createdAt: string; dueDate?: string; }
export interface ProjectSpace { id: string; name: string; description: string; members: { name: string; avatar: string; role: string }[]; tasks: TaskItem[]; classroomId?: number; groupName?: string; }

// Specific feature fetchers
export function useCurrentUserProfile() {
  const { authUser, userProfile } = useAuth();
  const uid = authUser?.uid;
  const { data, loading } = useFirestoreDoc<any>("users", uid, userProfile || defaultUserProfile);
  return { profile: data || defaultUserProfile, loading };
}

export function useTeacherActivities() { return useFirestoreCollection<any>("teacherActivities", [], []); }
export function useTeacherStudents() { return useFirestoreCollection<any>("teacherStudents", [], []); }
export function useNotifications() { return useFirestoreCollection<any>("notifications", [], []); }
export function useProjectSpaces() { return useFirestoreCollection<ProjectSpace>("projectSpaces", [], []); }
export function useTeammates() { return useFirestoreCollection<any>("teammates", [], []); }
export function useDeadlines() { return useFirestoreCollection<any>("deadlines", [], []); }
export function useActiveProjects() { return useFirestoreCollection<any>("activeProjects", [], []); }
export function usePortfolioProjects() { return useFirestoreCollection<any>("portfolioProjects", [], []); }
export function useExperienceTimeline() { return useFirestoreCollection<any>("experienceTimeline", [], []); }
export function useSkillData() { return useFirestoreCollection<any>("skillData", [], []); }
export function useSkillGapData() { return useFirestoreCollection<any>("skillGapData", [], []); }
export function useGrowthTimeline() { return useFirestoreCollection<any>("growthTimeline", [], []); }
export function useCareerRecommendation() { return useFirestoreDoc<any>("careerRecommendations", "default", defaultCareerRecommendation); }

export const skillTagsDefault = ["AI & ML", "Finance", "Marketing", "Data", "Leadership"];

export const aiChatMessagesDefault = [
  { role: "assistant", content: "สวัสดีครับ! ผมเป็น AI คู่คิดของคุณ ถามอะไรเกี่ยวกับโปรเจกต์ได้เลยนะครับ" },
];
export const aiMockResponsesDefault: Record<string, string> = {
  default: "เข้าใจครับ! ลองอธิบายเพิ่มเติมได้ไหมครับว่าอยากให้ช่วยในส่วนไหน?",
  task: "แนะนำให้แบ่งงานออกเป็น 3 ส่วนหลัก:\n1. **Research & Planning** — เก็บข้อมูล + ออกแบบ\n2. **Development** — สร้าง prototype + coding\n3. **Testing & Launch** — ทดสอบ + deploy\n\nแต่ละส่วนควรมีคนรับผิดชอบชัดเจนครับ",
  topic: "สำหรับหัวข้อโปรเจกต์ ลองดูแนวทางนี้:\n- **AI + Education**: ระบบติวเตอร์อัจฉริยะ\n- **AI + Agriculture**: ตรวจจับโรคพืชด้วยภาพ\n- **AI + Health**: ระบบแนะนำการออกกำลังกาย\n\nเลือกหัวข้อที่ทีมถนัดและมี dataset ให้ใช้ครับ",
  tech: "สำหรับ tech stack แนะนำ:\n- **Frontend**: React + TypeScript + Tailwind\n- **Backend**: Node.js + Express หรือ FastAPI\n- **Database**: PostgreSQL\n- **AI/ML**: Python + TensorFlow/PyTorch\n- **Deploy**: Docker + Cloud Run\n\nเลือกตามความถนัดของทีมได้เลยครับ",
};
