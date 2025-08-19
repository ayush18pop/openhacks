import { useInfiniteQuery } from '@tanstack/react-query';
import { EventsParams, EventsResponse, eventKeys } from './useEvents';

// Infinite query for events with pagination
export const useInfiniteEvents = (params: Omit<EventsParams, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: eventKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (pageParam) searchParams.set('cursor', pageParam);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.order) searchParams.set('order', params.order);
      if (params.mode && params.mode !== 'ALL') searchParams.set('mode', params.mode);

      const response = await fetch(`/api/events?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const result: EventsResponse = await response.json();
      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
