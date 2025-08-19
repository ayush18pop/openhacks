"use client";

import { Button } from "../../components/retroui/Button";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [step, setStep] = useState<"role" | "questions">("role");
  const [role, setRole] = useState<"PARTICIPANT" | "ORGANISER" | "JUDGE" | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  interface Profile {
    name?: string;
    bio?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    university?: string;
    graduationYear?: string;
    [key: string]: string | undefined;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setSuccess("Profile saved successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        <input
          className="w-full border p-2"
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
          placeholder="Name"
        />
        <textarea
          className="w-full border p-2"
          name="bio"
          value={profile.bio || ""}
          onChange={handleChange}
          placeholder="Bio"
        />
        <input
          className="w-full border p-2"
          name="website"
          value={profile.website || ""}
          onChange={handleChange}
          placeholder="Website"
        />
        <input
          className="w-full border p-2"
          name="github"
          value={profile.github || ""}
          onChange={handleChange}
          placeholder="GitHub"
        />
        <input
          className="w-full border p-2"
          name="linkedin"
          value={profile.linkedin || ""}
          onChange={handleChange}
          placeholder="LinkedIn"
        />
        <input
          className="w-full border p-2"
          name="twitter"
          value={profile.twitter || ""}
          onChange={handleChange}
          placeholder="Twitter"
        />
        <input
          className="w-full border p-2"
          name="university"
          value={profile.university || ""}
          onChange={handleChange}
          placeholder="University"
        />
        <input
          className="w-full border p-2"
          name="graduationYear"
          value={profile.graduationYear || ""}
          onChange={handleChange}
          placeholder="Graduation Year"
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}

