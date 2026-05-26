"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Profile = {
  name: string;
  email: string;
  role: string;
  school: string;
  bio: string;
};

export type Settings = {
  defaultSubject: string;
  defaultGrade: string;
  defaultSchool: string;
  theme: "system" | "light" | "dark";
  emailOnReady: boolean;
  soundOnReady: boolean;
};

type Store = {
  profile: Profile;
  settings: Settings;
  setProfile: (p: Partial<Profile>) => void;
  setSettings: (s: Partial<Settings>) => void;
};

export const useProfile = create<Store>()(
  persist(
    (set) => ({
      profile: {
        name: "John Doe",
        email: "tech@discoverventures.in",
        role: "Teacher",
        school: "Delhi Public School",
        bio: "Setting fair, age-appropriate assessments with AI.",
      },
      settings: {
        defaultSubject: "Science",
        defaultGrade: "Class 8",
        defaultSchool: "Delhi Public School",
        theme: "system",
        emailOnReady: true,
        soundOnReady: false,
      },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
    }),
    { name: "vedaai.profile" }
  )
);
