"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { HackathonCard, CardSkeleton } from '../../components/ui/HackathonCard';
import { DotBackground } from '../../components/ui/DotBackground'; // A new background component
import clsx from 'clsx';

type Hackathon = {
  id: string;
  title: string;
  description: string;
  mode: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  imageUrl: string;
  _count: {
    registrations: number;
  };
  // Add any other required properties here
};
type SortOption = 'startAt' | 'createdAt';
type ModeOption = 'ALL' | 'ONLINE' | 'HYBRID' | 'OFFLINE';

export default function HackathonEventsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // State for filters
  const [sortBy, setSortBy] = useState<SortOption>('startAt');
  const [mode, setMode] = useState<ModeOption>('ALL');

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastEventElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchHackathons(nextCursor, false); // Fetch next page, don't reset
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, nextCursor]);
  
  const fetchHackathons = async (cursor: string | null = null, reset = true) => {
    setLoading(true);
    if(reset) setHackathons([]); // Reset events if it's a new filter

    let url = `/api/events?limit=9&sortBy=${sortBy}&order=asc`;
    if (cursor) url += `&cursor=${cursor}`;
    if (mode !== 'ALL') url += `&mode=${mode}`;
    
    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setHackathons(prev => reset ? result.data : [...prev, ...result.data]);
        setNextCursor(result.nextCursor);
        setHasMore(!!result.nextCursor);
      } else {
        setError("Failed to fetch hackathons.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger a refetch when filters change
  useEffect(() => {
    fetchHackathons(null, true);
  }, [sortBy, mode]);

  if (error && hackathons.length === 0) {
    return <div className="text-center py-20 text-destructive">Error: {error}</div>;
  }
  
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <DotBackground>
        <div className="container mx-auto px-4 py-12 md:py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Explore Hackathons
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] mb-12 max-w-2xl mx-auto">
            Discover, compete, and innovate. Find your next challenge and build something amazing.
            </p>
        </div>
      </DotBackground>

      <main className="container mx-auto px-4 pb-20 -mt-12">
        {/* Filter and Sort Controls */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center sticky top-4 z-20 backdrop-blur-sm bg-opacity-80">
            <div className="flex gap-2">
                {(['ALL', 'ONLINE', 'HYBRID', 'OFFLINE'] as ModeOption[]).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={clsx("px-4 py-2 text-sm font-semibold rounded-md transition-colors", {
                        "bg-primary text-primary-foreground": mode === m,
                        "hover:bg-accent": mode !== m
                    })}>{m}</button>
                ))}
            </div>
            <div className="sm:ml-auto">
                <select onChange={(e) => setSortBy(e.target.value as SortOption)} value={sortBy} className="bg-transparent border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="startAt">Sort by Start Date</option>
                    <option value="createdAt">Sort by Date Posted</option>
                </select>
            </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon, index) => {
            const isLastElement = hackathons.length === index + 1;
            return isLastElement ? (
                <div ref={lastEventElementRef} key={hackathon.id}><HackathonCard hackathon={hackathon} /></div>
            ) : (
                <HackathonCard hackathon={hackathon} key={hackathon.id} />
            );
          })}
          
          {loading && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={`skeleton-${i}`} />)}
        </div>

        {!loading && !hasMore && (
            <p className="text-center text-[var(--muted-foreground)] mt-12">You&apos;ve reached the end!</p>
        )}
      </main>
    </div>
  );
}