"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../components/retroui/Card";
import { Button } from "../../components/retroui/Button";
import { Input } from "../../components/retroui/Input";
import { Label } from "../../components/retroui/Label";
import { Text } from "../../components/retroui/Text";
import { Save } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// --- Type Definition ---
type Profile = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  university?: string | null;
  graduationYear?: number | null;
};

// --- Data Fetching Hooks ---
const useProfileData = () => useQuery< { data: Profile } >({
  queryKey: ['profileData'],
  queryFn: async () => {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },
});

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'Failed to save profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileData'] });
    },
  });
};

// --- Main Page Component ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { isLoaded: clerkLoaded, user } = useUser();
  
  const { data: response, isLoading, error } = useProfileData();
  const updateProfile = useUpdateProfile();

  // Initialize form state when data is fetched
  useEffect(() => {
    if (response?.data) {
      setProfile(response.data);
    }
  }, [response]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (profile) {
      updateProfile.mutate(profile);
    }
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(response?.data);

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading Profile...</div>;
  if (error) return <div className="p-6 text-center text-destructive">Error: {error.message}</div>;
  if (!profile) return null;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24">
          <Image
            src={profile.avatar || (clerkLoaded ? user?.imageUrl : undefined) || '/retro-pixel-avatar.png'}
            alt={profile.name || "Avatar"}
            width={96}
            height={96}
            className="border-2 border-border shadow-md object-cover"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || updateProfile.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Unified Profile Form */}
      <Card className="w-full">
        <CardHeader className="border-b-2 border-border p-4">
          <h2 className="text-lg font-medium">Profile</h2>
        </CardHeader>

        <CardContent className="p-6 w-full">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div className="space-y-4">
              <FormField label="Full Name" name="name" value={profile.name ?? ''} onChange={handleChange} />
              <FormField label="Bio" name="bio" value={profile.bio ?? ''} onChange={handleChange} type="textarea" placeholder="Tell us a bit about yourself..." />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Social</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Website" name="website" value={profile.website ?? ''} onChange={handleChange} placeholder="https://your-site.com" />
                <FormField label="GitHub" name="github" value={profile.github ?? ''} onChange={handleChange} placeholder="github-username" />
                <FormField label="LinkedIn" name="linkedin" value={profile.linkedin ?? ''} onChange={handleChange} placeholder="linkedin.com/in/..." />
                <FormField label="Twitter" name="twitter" value={profile.twitter ?? ''} onChange={handleChange} placeholder="@twitterhandle" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="University" name="university" value={profile.university ?? ''} onChange={handleChange} />
                <FormField label="Graduation Year" name="graduationYear" value={profile.graduationYear ?? ''} onChange={handleChange} type="number" placeholder="2025" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!hasChanges || updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setProfile(response?.data ?? null)} disabled={!hasChanges}>
                Revert
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {updateProfile.isSuccess && <Text className="text-center text-green-500">Profile saved successfully!</Text>}
      {updateProfile.isError && <Text className="text-center text-destructive">{(updateProfile.error as Error).message}</Text>}
    </main>
  );
}

// --- Reusable Sub-components ---
// ...TabButton removed — unified form used instead

const FormField = ({ label, name, value, onChange, type = "text", placeholder = "" }: { label: string, name: string, value: string | number | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, placeholder?: string }) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    {type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full mt-1 p-2 border-2 border-border shadow-sm bg-background"
        placeholder={placeholder}
        rows={4}
      />
    ) : (
      <Input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1"
      />
    )}
  </div>
);
