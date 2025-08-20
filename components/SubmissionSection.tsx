'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './retroui/Card';
import { Button } from './retroui/Button';
import { Input } from './retroui/Input';
import { Label } from './retroui/Label';
import { Text } from './retroui/Text';
import { Textarea } from './retroui/Textarea';
import { Loader2, Github, Trophy, CheckCircle } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  eventId: string;
  ownerId: string;
  members: Array<{ id: string; name: string | null }>;
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
}

interface SubmissionSectionProps {
  team: Team;
}

interface SubmissionFormData {
  projectName: string;
  description: string;
  githubUrl: string;
}

const useSubmission = (eventId: string, teamId: string) => {
  return useQuery({
    queryKey: ['submission', eventId, teamId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/submissions?teamId=${teamId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch submission');
      }
      const data = await res.json();
      return data.data as Submission | null;
    },
  });
};

const useCreateSubmission = (eventId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SubmissionFormData & { teamId: string }) => {
      const res = await fetch(`/api/events/${eventId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create submission');
      }
      
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch submission data
      queryClient.invalidateQueries({ 
        queryKey: ['submission', eventId, variables.teamId] 
      });
    },
  });
};

export default function SubmissionSection({ team }: SubmissionSectionProps) {
  const [formData, setFormData] = useState<SubmissionFormData>({
    projectName: '',
    description: '',
    githubUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  const { data: submission, isLoading } = useSubmission(team.eventId, team.id);
  const createSubmission = useCreateSubmission(team.eventId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }
    if (!formData.githubUrl.trim() || !formData.githubUrl.includes('github.com')) {
      setError('Please provide a valid GitHub URL');
      return;
    }

    try {
      await createSubmission.mutateAsync({
        ...formData,
        teamId: team.id
      });
      
      // Reset form
      setFormData({
        projectName: '',
        description: '',
        githubUrl: ''
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-[var(--border)]">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <Text>Loading submission status...</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[var(--border)] shadow-md">
      <CardHeader className="bg-[var(--card)] border-b-2 border-[var(--border)]">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--primary)]" />
          Project Submission - {team.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {submission ? (
          // Read-only view for existing submission
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <Text className="font-medium">Submission Complete!</Text>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-bold">Project Name</Label>
                <div className="mt-1 p-3 bg-[var(--muted)] border-2 border-[var(--border)] rounded">
                  <Text>{submission.projectName}</Text>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-bold">Description</Label>
                <div className="mt-1 p-3 bg-[var(--muted)] border-2 border-[var(--border)] rounded min-h-[80px]">
                  <Text className="whitespace-pre-wrap">{submission.description}</Text>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-bold">GitHub Repository</Label>
                <div className="mt-1 p-3 bg-[var(--muted)] border-2 border-[var(--border)] rounded">
                  <a 
                    href={submission.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                  >
                    <Github className="w-4 h-4" />
                    {submission.githubUrl}
                  </a>
                </div>
              </div>
              
              <div className="pt-2 text-sm text-[var(--muted-foreground)]">
                Submitted on {new Date(submission.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ) : (
          // Submission form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="projectName" className="text-sm font-bold">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter your project name"
                className="mt-1"
                disabled={createSubmission.isPending}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-bold">
                Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project, its features, and what makes it special..."
                className="mt-1"
                rows={4}
                disabled={createSubmission.isPending}
              />
              <Text className="text-xs text-[var(--muted-foreground)] mt-1">
                Minimum 10 characters ({formData.description.length}/10)
              </Text>
            </div>

            <div>
              <Label htmlFor="githubUrl" className="text-sm font-bold">
                GitHub Repository URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
                className="mt-1"
                disabled={createSubmission.isPending}
              />
              <Text className="text-xs text-[var(--muted-foreground)] mt-1">
                Link to your project&apos;s GitHub repository
              </Text>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded">
                <Text className="text-red-600 text-sm">{error}</Text>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={createSubmission.isPending}
              className="w-full"
            >
              {createSubmission.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Submit Project
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
