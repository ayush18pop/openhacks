'use client';

import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card } from '../../../../components/retroui/Card';
import { Button } from '../../../../components/retroui/Button';
import { JudgeManagement } from '../../../../components/organizer/JudgeManagement';

interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
  };
  startAt: string;
  endAt: string;
  mode: string;
}

type TabType = 'judges' | 'overview' | 'settings';

export default function EventManagePage() {
  const params = useParams();
  const eventId = params.id as string;
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch event details to verify organizer access
  const { data: eventResponse, isLoading, error } = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      return response.json();
    },
  });

  const event: Event = eventResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-head text-center">Loading event management...</h1>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-head text-[var(--destructive)]">Event not found</h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              You are not authorized to manage this event.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Check if current user is the organizer
  if (!user || user.id !== event.organizerId) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-head text-[var(--destructive)]">Access Denied</h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              You are not authorized to manage this event.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'judges', label: 'JUDGES' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <Card className="p-6">
          <h1 className="text-3xl font-head mb-2">EVENT MANAGEMENT</h1>
          <h2 className="text-xl font-head text-[var(--primary)]">
            {event.title}
          </h2>
          <p className="text-[var(--muted-foreground)] mt-2">
            Organizer: {event.organizer.name}
          </p>
        </Card>

        {/* Navigation Tabs */}
        <Card className="p-2">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`px-4 py-2 font-head ${
                  activeTab === tab.id ? '' : 'hover:bg-[var(--accent)]'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <Card className="p-6">
              <h3 className="text-xl font-head text-[var(--primary)] mb-4">EVENT OVERVIEW</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-head text-[var(--primary)] mb-2">DESCRIPTION:</h4>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {event.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-head text-[var(--primary)] mb-2">SCHEDULE:</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <strong>Start:</strong> {new Date(event.startAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <strong>End:</strong> {new Date(event.endAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    <strong>Mode:</strong> {event.mode}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'judges' && (
            <div className="space-y-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-head text-[var(--primary)]">JUDGING INTERFACE</h4>
                  <a 
                    href={`/events/${eventId}/judge`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button className="px-4 py-2">
                      OPEN JUDGE VIEW
                    </Button>
                  </a>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  Open the judging interface to score submissions
                </p>
              </Card>
              
              <JudgeManagement eventId={eventId} currentUserId={user.id} />
            </div>
          )}

          {activeTab === 'settings' && (
            <Card className="p-6">
              <h3 className="text-xl font-head text-[var(--primary)] mb-4">EVENT SETTINGS</h3>
              <p className="text-[var(--muted-foreground)]">
                Settings panel coming soon...
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
