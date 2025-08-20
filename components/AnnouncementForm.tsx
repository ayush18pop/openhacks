"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './retroui/Card';
import { Button } from './retroui/Button';
import { Text } from './retroui/Text';

export default function AnnouncementForm({ eventId }: { eventId?: string }) {
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, eventId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to send');
      }
      return res.json();
    },
    onSuccess: () => setMessage(''),
  });

  const disabled = !message.trim() || mutation.isPending || !eventId;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Send Announcement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your announcement..."
          className="w-full min-h-24 p-3 border-2 border-border rounded bg-background outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => mutation.mutate()}
            disabled={disabled}
            className="shrink-0"
          >
            {mutation.isPending ? 'Sending...' : 'Send'}
          </Button>
          {mutation.isError && (
            <Text className="text-red-600">{(mutation.error as Error).message}</Text>
          )}
          {mutation.isSuccess && <Text className="text-green-600">Sent!</Text>}
        </div>
      </CardContent>
    </Card>
  );
}
