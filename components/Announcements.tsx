"use client";

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { Card, CardHeader, CardTitle, CardContent } from './retroui/Card';
import { Text } from './retroui/Text';

export type AnnouncementPayload = {
  message: string;
  eventId: string;
  organizerId: string;
  timestamp: string; // ISO string
};

export default function Announcements() {
  const [items, setItems] = useState<AnnouncementPayload[]>([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      // Avoid initializing without keys
      return;
    }
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('announcements-channel');

    const handler = (data: AnnouncementPayload) => {
      setItems(prev => [data, ...prev].slice(0, 50));
    };

    channel.bind('new-announcement', handler);

    return () => {
      channel.unbind('new-announcement', handler);
      pusher.unsubscribe('announcements-channel');
      pusher.disconnect();
    };
  }, []);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Text className="text-muted-foreground">No announcements yet.</Text>
        ) : (
          <ul className="space-y-3">
            {items.map((a, idx) => (
              <li key={idx} className="p-3 border-2 border-border rounded bg-card/50">
                <div className="flex items-center justify-between mb-1">
                  <Text className="font-medium">{new Date(a.timestamp).toLocaleString()}</Text>
                </div>
                <Text>{a.message}</Text>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
