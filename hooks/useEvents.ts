import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export type Hackathon = {
  id: string;
  title: string;
  description: string;
  mode: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  imageUrl?: string;
  banner?: string;
  thumbnail?: string;
  organizer: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  _count: {
    registrations: number;
    teams: number;
  };
};

export type EventDetails = {
  id: string;
  title: string;
  description: string;
  theme?: string | null;
  mode: string;
  rules?: string | null;
  prizes?: string | null;
  startAt: string;
  endAt: string;
  banner?: string | null;
  organizer: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
};

export type SortOption = 'startAt' | 'createdAt';
export type ModeOption = 'ALL' | 'ONLINE' | 'HYBRID' | 'OFFLINE';

export type EventsParams = {
  limit?: number;
  cursor?: string | null;
  sortBy?: SortOption;
  order?: 'asc' | 'desc';
  mode?: ModeOption;
};

export type EventsResponse = {
  success: boolean;
  data: Hackathon[];
  nextCursor: string | null;
};

// API functions
const fetchEvents = async (params: EventsParams): Promise<EventsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.order) searchParams.set('order', params.order);
  if (params.mode && params.mode !== 'ALL') searchParams.set('mode', params.mode);

  const response = await fetch(`/api/events?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
};

const fetchEventById = async (eventId: string): Promise<{ success: boolean; data: EventDetails }> => {
  const response = await fetch(`/api/events/${eventId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch event details');
  }
  
  return response.json();
};

const fetchRegistrationStatus = async (eventId: string): Promise<{ isRegistered: boolean }> => {
  const response = await fetch(`/api/events/${eventId}/registration-status`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch registration status');
  }
  
  return response.json();
};

const registerForEvent = async (eventId: string): Promise<{ success: boolean; data?: unknown; error?: string }> => {
  const response = await fetch(`/api/events/${eventId}/register`, {
    method: 'POST',
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }
  
  return result;
};

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params: EventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  registration: (id: string) => [...eventKeys.all, 'registration', id] as const,
};

// Hooks
export const useEvents = (params: EventsParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => fetchEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => fetchEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRegistrationStatus = (eventId: string) => {
  return useQuery({
    queryKey: eventKeys.registration(eventId),
    queryFn: () => fetchRegistrationStatus(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for registration status)
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: registerForEvent,
    onSuccess: (data, eventId) => {
      // Invalidate and refetch registration status
      queryClient.invalidateQueries({ queryKey: eventKeys.registration(eventId) });
      // Optionally invalidate event details to update registration count
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
};
