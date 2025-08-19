"use client";

import { useState, useRef, useCallback } from "react";
import { HackathonCard, CardSkeleton } from '../../components/ui/HackathonCard';
import { DotBackground } from '../../components/ui/DotBackground';
import { useInfiniteEvents } from '../../hooks/useInfiniteEvents';
import { SortOption, ModeOption } from '../../hooks/useEvents';
import clsx from 'clsx';
import { motion } from "motion/react";

export default function HackathonEventsPage() {
  // State for filters
  const [sortBy, setSortBy] = useState<SortOption>('startAt');
  const [mode, setMode] = useState<ModeOption>('ALL');

  // TanStack Query for infinite loading
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteEvents({
    limit: 9,
    sortBy,
    order: 'asc',
    mode,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastEventElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  // Flatten all pages into a single array
  const hackathons = data?.pages.flatMap((page) => page.data) ?? [];

  if (status === 'pending') {
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
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <CardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-20 text-destructive">
        Error: {error?.message || 'Failed to fetch hackathons'}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <DotBackground>
        <div className="container mx-auto px-4 py-12 md:py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Explore Hackathons
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-lg text-[var(--muted-foreground)] mb-12 max-w-2xl mx-auto"
          >
            Discover, compete, and innovate. Find your next challenge and build something amazing.
          </motion.p>
        </div>
      </DotBackground>

      <main className="container mx-auto px-4 pb-20 -mt-12">
        {/* Filter and Sort Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center sticky top-4 z-20 backdrop-blur-sm bg-opacity-80"
        >
            <div className="flex gap-2">
                {(['ALL', 'ONLINE', 'HYBRID', 'OFFLINE'] as ModeOption[]).map(m => (
                    <button 
                      key={m} 
                      onClick={() => setMode(m)} 
                      className={clsx("px-4 py-2 text-sm font-semibold rounded-md transition-colors", {
                        "bg-primary text-primary-foreground": mode === m,
                        "hover:bg-accent": mode !== m
                      })}
                    >
                      {m}
                    </button>
                ))}
            </div>
            <div className="sm:ml-auto">
                <select 
                  onChange={(e) => setSortBy(e.target.value as SortOption)} 
                  value={sortBy} 
                  className="bg-transparent border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="startAt">Sort by Start Date</option>
                    <option value="createdAt">Sort by Date Posted</option>
                </select>
            </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon, index) => {
            const isLastElement = hackathons.length === index + 1;
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
                key={hackathon.id}
              >
                <HackathonCard hackathon={hackathon} />
              </motion.div>
            );
            return isLastElement ? (
              <div ref={lastEventElementRef} key={hackathon.id}>{card}</div>
            ) : card;
          })}
          
          {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CardSkeleton />
            </motion.div>
          ))}
        </div>

        {!isFetching && !hasNextPage && hackathons.length > 0 && (
            <p className="text-center text-[var(--muted-foreground)] mt-12">You&apos;ve reached the end!</p>
        )}
      </main>
    </div>
  );
}