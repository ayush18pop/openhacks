import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type TeamMember = { id: string; name: string | null; avatar: string | null };
export type Team = {
  id: string;
  name: string;
  event: { id: string; title: string };
  owner: TeamMember;
  members: TeamMember[];
};

type TeamsResponse = { success: boolean; data: Team[] };
type TeamResponse = { success: boolean; data: Team };

const fetchTeams = async (eventId?: string): Promise<TeamsResponse> => {
  const params = new URLSearchParams();
  if (eventId) params.set('eventId', eventId);
  const res = await fetch(`/api/teams?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to fetch teams');
  return body;
};

const createTeam = async (input: { eventId: string; name: string }): Promise<TeamResponse> => {
  const res = await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to create team');
  return body;
};

const addMember = async (input: { teamId: string; memberId: string }): Promise<{ success: boolean; data: TeamMember[] }> => {
  const res = await fetch(`/api/teams/${input.teamId}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId: input.memberId }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to add member');
  return body;
};

const removeMember = async (input: { teamId: string; memberId: string }): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`/api/teams/${input.teamId}/members`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId: input.memberId }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to remove member');
  return body;
};

export const teamKeys = {
  all: ['teams'] as const,
  list: (eventId?: string) => [...teamKeys.all, 'list', eventId] as const,
};

export const useTeams = (eventId?: string) => {
  return useQuery({ queryKey: teamKeys.list(eventId), queryFn: () => fetchTeams(eventId), enabled: true, staleTime: 60_000 });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.eventId) });
    },
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMember,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    },
  });
};

export const findUserByEmail = async (email: string): Promise<{ success: boolean; data?: { id: string; email: string; name: string | null }; error?: string }> => {
  const res = await fetch(`/api/users/find?email=${encodeURIComponent(email)}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'User lookup failed');
  return body;
};

// Invites
export type Invite = {
  id: string;
  teamId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELED';
  team?: { id: string; name: string; event: { id: string; title: string } };
  invitee?: { id: string; name: string | null; email: string };
};

export const listInvitesForTeam = async (teamId: string): Promise<{ success: boolean; data: Invite[] }> => {
  const res = await fetch(`/api/teams/${teamId}/invites`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to list invites');
  return body;
};

export const createInvite = async (input: { teamId: string; inviteeId: string }): Promise<{ success: boolean; data: Invite }> => {
  const res = await fetch(`/api/teams/${input.teamId}/invites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteeId: input.inviteeId }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to create invite');
  return body;
};

export const listMyInvites = async (): Promise<{ success: boolean; data: Invite[] }> => {
  const res = await fetch(`/api/invites`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to fetch invites');
  return body;
};

export const respondInvite = async (input: { inviteId: string; action: 'ACCEPT' | 'DECLINE' }): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`/api/invites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Failed to respond to invite');
  return body;
};

export const inviteKeys = {
  all: ['invites'] as const,
  team: (teamId: string | null) => [...inviteKeys.all, 'team', teamId] as const,
  mine: () => [...inviteKeys.all, 'mine'] as const,
};

export const useTeamInvites = (teamId: string | null) => {
  return useQuery({ queryKey: inviteKeys.team(teamId || 'none'), queryFn: () => listInvitesForTeam(teamId as string), enabled: Boolean(teamId), staleTime: 30_000 });
};

export const useMyInvites = () => {
  return useQuery({ queryKey: inviteKeys.mine(), queryFn: () => listMyInvites(), staleTime: 30_000 });
};

export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvite,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.team(variables.teamId) });
    },
  });
};

export const useRespondInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respondInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine() });
      queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    },
  });
};



