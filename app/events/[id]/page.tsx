"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEvent, useRegistrationStatus } from "../../../hooks/useHackathonData"; // Adjust path if needed

import { Calendar, User, Trophy, BookOpen, Scale, Award, Hash, ArrowRight } from "lucide-react";
import { Button } from "../../../components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/retroui/Card";
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
    organizer: { name: string };
  }

  const event = (eventResponse as { data?: Event })?.data;
  const isRegistered = (registrationResponse as { isRegistered?: boolean })?.isRegistered;

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

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

