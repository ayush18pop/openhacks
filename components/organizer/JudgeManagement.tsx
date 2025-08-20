'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Card } from '../retroui/Card';
import { Button } from '../retroui/Button';
import { Input } from '../retroui/Input';
import { toast } from 'sonner';

interface Judge {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills?: string;
  university?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills?: string;
  university?: string;
}

interface JudgeManagementProps {
  eventId: string;
  currentUserId: string;
}

export function JudgeManagement({ eventId, currentUserId }: JudgeManagementProps) {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch current judges
  const { data: judgesResponse, isLoading: judgesLoading } = useQuery({
    queryKey: ['event-judges', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/judges`);
      if (!response.ok) {
        throw new Error('Failed to fetch judges');
      }
      return response.json();
    },
  });

  const judges: Judge[] = judgesResponse?.data || [];

  // Search for user by email
  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/find?email=${encodeURIComponent(searchEmail)}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFoundUser(result.data);
        } else {
          setFoundUser(null);
          toast.error('User not found');
        }
      } else {
        setFoundUser(null);
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Failed to search for user');
      setFoundUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Add judge mutation
  const addJudgeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/events/${eventId}/judges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ judgeId: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add judge');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Judge added successfully!');
      queryClient.invalidateQueries({ queryKey: ['event-judges', eventId] });
      setFoundUser(null);
      setSearchEmail('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove judge mutation
  const removeJudgeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/events/${eventId}/judges`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ judgeId: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove judge');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Judge removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['event-judges', eventId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Add yourself as judge
  const addSelfAsJudge = () => {
    addJudgeMutation.mutate(currentUserId);
  };

  const handleAddJudge = (userId: string) => {
    addJudgeMutation.mutate(userId);
  };

  const handleRemoveJudge = (userId: string) => {
    removeJudgeMutation.mutate(userId);
  };

  const isCurrentUserJudge = judges.some(judge => judge.id === currentUserId);

  if (judgesLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-head text-[var(--primary)] mb-4">JUDGE MANAGEMENT</h3>
        <p className="text-[var(--muted-foreground)]">Loading judges...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Self */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-head text-[var(--primary)]">JUDGE MANAGEMENT</h3>
          {!isCurrentUserJudge && (
            <Button
              onClick={addSelfAsJudge}
              disabled={addJudgeMutation.isPending}
              className="px-4 py-2"
            >
              {addJudgeMutation.isPending ? 'ADDING...' : 'ADD YOURSELF AS JUDGE'}
            </Button>
          )}
        </div>
        
        <p className="text-[var(--muted-foreground)] mb-4">
          {judges.length} JUDGES ASSIGNED
        </p>

        {/* Add Judge by Email */}
        <div className="space-y-4 border-t border-[var(--border)] pt-4">
          <h4 className="font-head text-[var(--primary)]">ADD JUDGE BY EMAIL</h4>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter user email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUser()}
              />
            </div>
            <Button
              onClick={searchUser}
              disabled={isSearching || !searchEmail.trim()}
            >
              {isSearching ? 'SEARCHING...' : 'SEARCH'}
            </Button>
          </div>

          {/* Found User */}
          {foundUser && (
            <Card className="p-4 border-blue-600 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-head text-blue-600 dark:text-blue-400 mb-1">
                    {foundUser.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {foundUser.email}
                  </p>
                  {foundUser.university && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {foundUser.university}
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={() => handleAddJudge(foundUser.id)}
                  disabled={addJudgeMutation.isPending || judges.some(j => j.id === foundUser.id)}
                  className="px-4 py-2"
                >
                  {judges.some(j => j.id === foundUser.id) 
                    ? 'ALREADY JUDGE' 
                    : addJudgeMutation.isPending 
                      ? 'ADDING...' 
                      : 'ADD AS JUDGE'
                  }
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Current Judges List */}
      <Card className="p-6">
        <h4 className="text-lg font-head text-[var(--primary)] mb-4">CURRENT JUDGES</h4>
        
        {judges.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No judges assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {judges.map((judge) => (
              <div
                key={judge.id}
                className="flex items-center justify-between p-3 border border-[var(--border)] bg-[var(--card)] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {judge.avatar && (
                    <Image
                      src={judge.avatar}
                      alt={judge.name || 'Judge avatar'}
                      width={40}
                      height={40}
                      className="rounded border border-[var(--border)]"
                    />
                  )}
                  <div>
                    <p className="font-head text-[var(--foreground)]">
                      {judge.name || 'Unknown User'}
                      {judge.id === currentUserId && (
                        <span className="text-[var(--primary)] ml-2">(YOU)</span>
                      )}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {judge.email}
                    </p>
                    {judge.university && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {judge.university}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleRemoveJudge(judge.id)}
                  disabled={removeJudgeMutation.isPending}
                  className="px-3 py-1 text-sm bg-[var(--destructive)] hover:bg-[var(--destructive)]/80 text-[var(--destructive-foreground)] border-[var(--destructive)]"
                >
                  {removeJudgeMutation.isPending ? 'REMOVING...' : 'REMOVE'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
