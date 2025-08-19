"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/retroui/Card";
import { Button } from "../../../components/retroui/Button";
import { Input } from "../../../components/retroui/Input";
import { Label } from "../../../components/retroui/Label";
import { Textarea } from "../../../components/retroui/Textarea";
import { Text } from "../../../components/retroui/Text";
import { UploadCloud, Image as ImageIcon, Loader2, PartyPopper } from "lucide-react";

// --- Type Definitions ---
type EventFormData = {
  title: string;
  description: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  theme: string;
  startAt: string;
  endAt: string;
  rules: string;
  prizes: string;
  thumbnail: string;
  banner: string;
};

// --- API Mutation Hook ---
const useCreateEvent = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: Partial<EventFormData>) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'Failed to create event');
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch the events list
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Redirect to the new event's page
      router.push(`/events/${data.data.id}`);
    },
  });
};

// --- Main Page Component ---
export default function CreateEventPage() {
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    mode: 'ONLINE',
  });
  const [error, setError] = useState<string | null>(null);
  
  const createEvent = useCreateEvent();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic Validation
    if (!formData.title || !formData.startAt || !formData.endAt) {
      setError("Title, Start Date, and End Date are required.");
      return;
    }
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
        setError("End date must be after the start date.");
        return;
    }

    // --- FIX: Convert dates to ISO strings before sending ---
    const payload = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
    };

    createEvent.mutate(payload, {
        onError: (err) => setError((err as Error).message)
    });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">Create Your Hackathon</CardTitle>
            <CardDescription>Fill in the details to get your event up and running.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Core Details */}
              <Section title="Core Details">
                <FormField label="Event Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Retro Code Jam '25" required />
                <FormField label="Description" name="description" value={formData.description} onChange={handleChange} type="textarea" placeholder="What is your hackathon about?" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Theme" name="theme" value={formData.theme} onChange={handleChange} placeholder="e.g., 8-Bit Gaming" />
                  <div>
                    <Label>Mode</Label>
                    <select name="mode" value={formData.mode} onChange={handleChange} className="w-full mt-1 p-2 border-2 border-border shadow-sm bg-background">
                        <option value="ONLINE">Online</option>
                        <option value="OFFLINE">Offline</option>
                        <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>
              </Section>

              {/* Section 2: Schedule */}
              <Section title="Schedule">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Start Date & Time" name="startAt" value={formData.startAt} onChange={handleChange} type="datetime-local" required />
                  <FormField label="End Date & Time" name="endAt" value={formData.endAt} onChange={handleChange} type="datetime-local" required />
                </div>
              </Section>
              
              {/* Section 3: Branding */}
              <Section title="Branding">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploader label="Thumbnail Image (400x200)" onUpload={(url) => setFormData({...formData, thumbnail: url})} />
                    <ImageUploader label="Banner Image (1200x400)" onUpload={(url) => setFormData({...formData, banner: url})} />
                </div>
              </Section>

              {/* Section 4: Additional Info */}
              <Section title="Additional Information">
                <FormField label="Rules / Code of Conduct" name="rules" value={formData.rules} onChange={handleChange} type="textarea" placeholder="Outline the guidelines for participants." />
                <FormField label="Prizes" name="prizes" value={formData.prizes} onChange={handleChange} type="textarea" placeholder="e.g., 1st Place: $5000, 2nd Place: Swag Pack" />
              </Section>

              {/* Submission */}
              <div className="flex flex-col items-center pt-6">
                {error && <Text className="text-destructive mb-4">{error}</Text>}
                <Button type="submit" disabled={createEvent.isPending} className="w-full max-w-xs">
                  {createEvent.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><PartyPopper className="w-4 h-4 mr-2" /> Create Event</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// --- Reusable Sub-components ---
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4 border-t-2 border-border pt-6 first:border-t-0 first:pt-0">
        <h3 className="text-xl font-bold" style={{textShadow: 'none'}}>{title}</h3>
        {children}
    </div>
);

interface FormFieldProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: FormFieldProps) => (
  <div>
    <Label htmlFor={name}>{label} {required && <span className="text-destructive">*</span>}</Label>
    {type === 'textarea' ? (
      <Textarea id={name} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} className="mt-1" rows={4} />
    ) : (
      <Input id={name} name={name} type={type} value={value || ""} onChange={onChange} placeholder={placeholder} className="mt-1" />
    )}
  </div>
);

const ImageUploader = ({ label, onUpload }: { label: string, onUpload: (url: string) => void }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      // Try to parse JSON safely
      let data: unknown = null;
      try {
        data = await res.json();
      } catch (_) {
        const text = await res.text();
        throw new Error(text || 'Upload failed: invalid response from server');
      }

      // Type assertion for data
      const responseData = data as {
        url?: string;
        secure_url?: string;
        result?: { secure_url?: string };
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        throw new Error(responseData?.error || responseData?.message || 'Upload failed');
      }

      const url = responseData?.url ?? responseData?.secure_url ?? responseData?.result?.secure_url;
      if (!url) throw new Error('Upload succeeded but no URL returned');

      onUpload(url);
    } catch (err) {
      console.error('Image upload error:', err);
            // Notify the user — keep it simple here, replace with toast if available
            const message = err instanceof Error ? err.message : 'Failed to upload image';
            alert(message);
    } finally {
      setUploading(false);
    }
    };

    return (
        <div>
            <Label>{label}</Label>
            <div className="mt-1 h-40 border-2 border-dashed border-border flex items-center justify-center relative bg-card overflow-hidden">
                {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-8 w-8" />
                        <p>Click to upload</p>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
                <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" disabled={uploading} />
            </div>
        </div>
    );
};
