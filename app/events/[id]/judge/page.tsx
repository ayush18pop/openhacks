'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card } from '../../../../components/retroui/Card';
import { Button } from '../../../../components/retroui/Button';
import { Input } from '../../../../components/retroui/Input';
import { Label } from '../../../../components/retroui/Label';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  owner: { id: string; name: string };
  members: { id: string; name: string }[];
}

interface Submission {
  id: string;
  projectName: string;
  description: string;
  githubUrl: string;
  eventId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  team: Team | null;
}

interface ScoreData {
  submissionId: string;
  roundId: string;
  score: number;
  feedback?: string;
}

export default function JudgePage() {
  const params = useParams();
  const eventId = params.id as string;
  const queryClient = useQueryClient();
  
  const [scores, setScores] = useState<Record<string, { score: string; feedback: string }>>({});
  const [selectedRound] = useState('round-1'); // For now, we'll use a default round

  // Fetch all submissions for this event
  const { data: submissionsResponse, isLoading } = useQuery({
    queryKey: ['event-submissions', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/submissions?judge=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      return response.json();
    },
  });

  const submissions: Submission[] = submissionsResponse?.data || [];

  // Mutation for saving scores
  const scoreMutation = useMutation({
    mutationFn: async (scoreData: ScoreData) => {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save score');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Score saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['event-submissions', eventId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleScoreChange = (submissionId: string, field: 'score' | 'feedback', value: string) => {
    setScores(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleSubmitScore = (submissionId: string) => {
    const scoreData = scores[submissionId];
    if (!scoreData?.score) {
      toast.error('Please enter a score');
      return;
    }

    const score = parseFloat(scoreData.score);
    if (isNaN(score) || score < 1 || score > 10) {
      toast.error('Score must be between 1 and 10');
      return;
    }

    scoreMutation.mutate({
      submissionId,
      roundId: selectedRound,
      score,
      feedback: scoreData.feedback || undefined
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="container mx-auto px-4 py-12">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-head mb-4">Loading submissions...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="card p-6 bg-[var(--card)]">
          <h1 className="text-3xl font-head mb-2">JUDGING INTERFACE</h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            {submissions.length} SUBMISSIONS FOUND
          </p>
        </div>

        {/* Submissions Grid */}
        {submissions.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-head mb-2">NO SUBMISSIONS FOUND</h2>
            <p className="text-[var(--muted-foreground)]">
              Teams haven&apos;t submitted their projects yet.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Submission Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-head text-[var(--primary)] mb-2">
                        {submission.projectName}
                      </h3>
                      <p className="text-[var(--muted-foreground)] mb-2">
                        Team: {submission.team?.name || 'Unknown Team'}
                      </p>
                      <p className="text-[var(--muted-foreground)] text-sm mb-4">
                        Owner: {submission.team?.owner.name}
                        {submission.team?.members && submission.team.members.length > 0 && (
                          <span>
                            <br />
                            Members: {submission.team.members.map(m => m.name).join(', ')}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-head text-[var(--primary)] mb-2">DESCRIPTION:</h4>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4">
                        {submission.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-head text-[var(--primary)] mb-2">GITHUB URL:</h4>
                      <a 
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {submission.githubUrl}
                      </a>
                    </div>
                  </div>

                  {/* Scoring Interface */}
                  <div className="space-y-4 border-l border-[var(--border)] pl-6">
                    <h4 className="text-lg font-head text-[var(--primary)]">SCORING</h4>
                    
                    <div>
                      <Label htmlFor={`score-${submission.id}`} className="font-head">
                        Score (1-10):
                      </Label>
                      <Input
                        id={`score-${submission.id}`}
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        placeholder="Enter score..."
                        value={scores[submission.id]?.score || ''}
                        onChange={(e) => handleScoreChange(submission.id, 'score', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`feedback-${submission.id}`} className="font-head">
                        Feedback (Optional):
                      </Label>
                      <textarea
                        id={`feedback-${submission.id}`}
                        placeholder="Enter feedback for the team..."
                        value={scores[submission.id]?.feedback || ''}
                        onChange={(e) => handleScoreChange(submission.id, 'feedback', e.target.value)}
                        className="w-full mt-1 p-3 bg-[var(--background)] border-2 border-[var(--border)] text-[var(--foreground)] font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-vertical min-h-[80px] shadow-md"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={() => handleSubmitScore(submission.id)}
                      disabled={scoreMutation.isPending || !scores[submission.id]?.score}
                      className="w-full"
                    >
                      {scoreMutation.isPending ? 'SAVING...' : 'SUBMIT SCORE'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
