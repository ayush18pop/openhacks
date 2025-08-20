"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEvent, useRegistrationStatus } from "../../../hooks/useHackathonData";
import FAQSection from "../../../components/events/FAQSection";
import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

import { Calendar, User, Trophy, BookOpen, Scale, Award, Hash, ArrowRight } from "lucide-react";
import { Button } from "../../../components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/retroui/Card";
import { Text } from "../../../components/retroui/Text";

// --- Helper Function ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

// --- Main Page Component ---
export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  // --- Data Fetching ---
  const { data: eventResponse, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { data: registrationResponse, isLoading: regLoading } = useRegistrationStatus(eventId);

  // --- Derived State ---
  const isLoading = eventLoading || regLoading;
  const error = eventError?.message;
  interface Event {
    banner?: string;
    title: string;
    description: string;
    rules?: string;
    prizes?: string;
    startAt: string;
    endAt: string;
    theme?: string;
    mode: string;
    organizer: { id?: string; name: string };
    tracksJson?: string | null;
    timeline?: string | null;
    organizersJson?: string | null;
    faqs?: Array<{ question: string; answer: string }>;
  }

  const event = (eventResponse as { data?: Event & { faqs?: Array<{ question: string; answer: string }> } })?.data;
  const isRegistered = (registrationResponse as { isRegistered?: boolean })?.isRegistered;
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const message = json?.message || res.statusText || 'Delete failed';
        alert(`Failed to delete event: ${message}`);
        setDeleting(false);
        return;
      }
      // Redirect to events list after successful deletion
      router.push('/events');
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the event.');
      setDeleting(false);
    }
  }, [eventId, router]);

  // --- Render Logic ---
  if (isLoading) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading Event Details...</div>;
  }
  if (error) {
    return <div className="min-h-[60vh] grid place-items-center text-destructive">Error: {error}</div>;
  }
  if (!event) {
    return <div className="min-h-[60vh] grid place-items-center">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Banner Image */}
      {event.banner && (
        <div className="relative h-64 md:h-80 w-full border-b-4 border-[var(--border)]">
          <Image src={event.banner} alt={`${event.title} Banner`} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl md:text-5xl">{event.title}</h1>
            
            <section className="card p-6">
              <h2 className="text-2xl mb-4 flex items-center"><BookOpen className="w-6 h-6 mr-3 text-[var(--primary)]" />Description</h2>
              <Text className="text-muted-foreground whitespace-pre-wrap">{event.description}</Text>
            </section>
            
            {event.rules && (
              <section className="card p-6">
                <h2 className="text-2xl mb-4 flex items-center"><Scale className="w-6 h-6 mr-3 text-[var(--primary)]" />Rules</h2>
                <Text className="text-muted-foreground whitespace-pre-wrap">{event.rules}</Text>
              </section>
            )}

            {/* Tracks */}
            {event.tracksJson && (
              <section className="card p-6">
                <h2 className="text-2xl mb-4 flex items-center"><Hash className="w-6 h-6 mr-3 text-[var(--primary)]" />Tracks</h2>
                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    try {
                      const arr = JSON.parse(event.tracksJson as string);
                      if (Array.isArray(arr)) return arr.map((t: string) => <span key={t} className="bg-gray-100 px-3 py-1 rounded-full">{t}</span>);
                    } catch {
                      return (event.tracksJson || '').split(/\r?\n|,/).map(s => s.trim()).filter(Boolean).map((t, i) => <span key={i} className="bg-gray-100 px-3 py-1 rounded-full">{t}</span>);
                    }
                    return null;
                  })()}
                </div>
              </section>
            )}

            {/* Timeline */}
            {event.timeline && (
              <section className="card p-6">
                <h2 className="text-2xl mb-4 flex items-center"><Calendar className="w-6 h-6 mr-3 text-[var(--primary)]" />Timeline</h2>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  {(() => {
                    try {
                      const arr = JSON.parse(event.timeline as string);
                      if (Array.isArray(arr)) return arr.map((t: string, i: number) => <li key={i}>{t}</li>);
                    } catch {
                      return (event.timeline || '').split(/\r?\n/).map((s: string, i: number) => <li key={i}>{s}</li>);
                    }
                    return null;
                  })()}
                </ol>
              </section>
            )}

            {/* Co-organizers */}
            {event.organizersJson && (
              <section className="card p-6">
                <h2 className="text-2xl mb-4 flex items-center"><User className="w-6 h-6 mr-3 text-[var(--primary)]" />Co-organizers</h2>
                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    try {
                      const arr = JSON.parse(event.organizersJson as string);
                      if (Array.isArray(arr)) return arr.map((o: string) => <span key={o} className="bg-gray-100 px-3 py-1 rounded-full">{o}</span>);
                    } catch {
                      return (event.organizersJson || '').split(/\r?\n|,/).map(s => s.trim()).filter(Boolean).map((o, i) => <span key={i} className="bg-gray-100 px-3 py-1 rounded-full">{o}</span>);
                    }
                    return null;
                  })()}
                </div>
              </section>
            )}

            {event.prizes && (
              <section className="card p-6">
                <h2 className="text-2xl mb-4 flex items-center"><Award className="w-6 h-6 mr-3 text-[var(--primary)]" />Prizes</h2>
                <Text className="text-muted-foreground whitespace-pre-wrap">{event.prizes}</Text>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Call to Action Card */}
              <Card>
                <CardContent className="p-6">
                  {isRegistered ? (
                    <Link href={`/events/${eventId}/register`} passHref>
                      <Button className="w-full">
                        Manage Team & Registration
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/events/${eventId}/register`} passHref>
                      <Button className="w-full">
                        Register Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {isRegistered && <Text className="text-center text-sm text-green-500 mt-3">You are registered for this event.</Text>}
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card>
                <CardHeader>
                    <CardTitle style={{ textShadow: 'none' }}>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-3 mt-1 text-[var(--primary)] shrink-0"/>
                        <span className="flex-1">
                            <strong>Starts:</strong> {formatDate(event.startAt)}<br/>
                            <strong>Ends:</strong> {formatDate(event.endAt)}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Hash className="w-4 h-4 mr-3 text-[var(--primary)] shrink-0"/>
                        <span><strong>Theme:</strong> {event.theme || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-3 text-[var(--primary)] shrink-0"/>
                        <span><strong>Mode:</strong> {event.mode}</span>
                    </div>
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-[var(--primary)] shrink-0"/>
                        <span><strong>Organizer:</strong> {event.organizer.name}</span>
                    </div>
                </CardContent>
              </Card>
              {/* Organizer-only Delete Button */}
              {clerkUser?.id && event.organizer?.id && clerkUser.id === event.organizer.id && (
                <Card>
                  <CardContent className="p-4">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting...' : 'Delete Event'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* FAQ Section */}
              {event?.faqs && event.faqs.length > 0 && (
                <div className="mt-6">
                  <FAQSection faqs={event.faqs} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
