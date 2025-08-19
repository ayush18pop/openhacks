import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const fetcher = async (url: string) => {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'An error occurred');
  return body;
};

const poster = async (url: string, data: unknown) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'An error occurred');
  return body;
};

const deleter = async (url: string, data: unknown) => {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'An error occurred');
  return body;
};

// --- QUERIES ---

export const useEvent = (eventId: string) => useQuery({
  queryKey: ['event', eventId],
  queryFn: () => fetcher(`/api/events/${eventId}`),
  enabled: !!eventId,
});


export const useRegistrationStatus = (eventId: string) => useQuery({
  queryKey: ['registrationStatus', eventId],
  queryFn: () => fetcher(`/api/events/${eventId}/registration-status`),
  enabled: !!eventId,
});


export const useTeams = (eventId?: string) => useQuery({
  queryKey: ['teams', eventId],
  queryFn: () => fetcher(eventId ? `/api/teams?eventId=${eventId}` : '/api/teams'),
  enabled: true,
});


export const useMyInvites = () => useQuery({
  queryKey: ['myInvites'],
  queryFn: () => fetcher('/api/invites'),
});

// --- MUTATIONS ---

export const useRegisterForEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => poster(`/api/events/${eventId}/register`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrationStatus', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
};


export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventId: string; name: string }) => poster('/api/teams', data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.eventId] });
    },
  });
};


export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { teamId: string; inviteeId: string }) => poster(`/api/teams/${data.teamId}/invites`, { inviteeId: data.inviteeId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
};



export const useRespondInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { inviteId: string; action: 'ACCEPT' | 'DECLINE' }) => poster('/api/invites', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvites'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Alias for backward compatibility
export const useRespondToInvite = useRespondInvite;

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { teamId: string; memberId: string }) => deleter(`/api/teams/${data.teamId}/members`, { memberId: data.memberId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
};
