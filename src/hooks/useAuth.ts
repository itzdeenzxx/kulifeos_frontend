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

// Global cache to prevent repeated fetching of the same user profile
let globalCachedProfile: { uid: string; profile: UserProfile } | null = null;

export function useAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!isMounted) return;
        setAuthUser(user);
        
        if (user) {
          // Use global cache if valid
          if (globalCachedProfile && globalCachedProfile.uid === user.uid) {
            setUserProfile(globalCachedProfile.profile);
            localStorage.setItem("ku_current_user_id", user.uid);
            setLoading(false);
            return;
          }

          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!isMounted) return;

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            globalCachedProfile = { uid: user.uid, profile: data };
            setUserProfile(data);
            localStorage.setItem("ku_current_user_id", user.uid);
          } else {
            setError("User profile not found");
            await signOut(auth);
            navigate("/auth");
          }
        } else {
          globalCachedProfile = null;
          setUserProfile(null);
          localStorage.removeItem("ku_current_user_id");
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Auth error:", err);
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
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
