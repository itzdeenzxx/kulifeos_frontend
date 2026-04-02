import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  role: "student" | "teacher";
  onboardingStep: number; // 0-3 for steps, 4 means completed
  onboardingData?: any;
  createdAt: number;
  updatedAt: number;
}

export function useAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setAuthUser(user);
        
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
            localStorage.setItem("ku_current_user_id", user.uid);
          } else {
            setError("User profile not found");
            await signOut(auth);
            navigate("/auth");
          }
        } else {
          setUserProfile(null);
          localStorage.removeItem("ku_current_user_id");
        }
      } catch (err: any) {
        console.error("Auth error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return {
    authUser,
    userProfile,
    loading,
    error,
    isAuthenticated: !!authUser,
    logout: () => signOut(auth),
  };
}
