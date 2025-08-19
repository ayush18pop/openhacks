"use client";

import { useEffect, useState, useRef } from "react";

// The fonts are assumed to be configured in a global stylesheet or layout.tsx
// using CSS variables and the @import from the user's global CSS file.

// Dummy data to simulate the API response. In a real application, this would be fetched from the backend.
const dummyApiResponse = {
  success: true,
  data: [
    {
      id: "cmeics1qk0001wvjcrj35kkcv",
      title: "Innovate AI: The Future of Automation",
      description: "Join the brightest minds to build the next generation of AI-powered applications. A 48-hour sprint to innovate, collaborate, and create.",
      theme: "Artificial Intelligence and Machine Learning",
      mode: "HYBRID",
      rules: "1. Teams of 1-4 members. 2. All code must be written during the event. 3. Submissions will be judged on innovation, impact, and technical execution.",
      timeline: null,
      prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
      sponsors: null,
      startAt: "2025-10-24T09:00:00.000Z",
      endAt: "2025-10-26T17:00:00.000Z",
      organizerId: "user_31SnRx2U6qIF6ZrtGNxafwVrdST",
      createdAt: "2025-08-19T09:40:17.993Z",
      updatedAt: "2025-08-19T09:40:17.993Z",
      organizer: {
        id: "user_31SnRx2U6qIF6ZrtGNxafwVrdST",
        name: "Ayush Popat",
        email: "ayushworks18@gmail.com"
      },
      judges: [],
      _count: {
        registrations: 0,
        teams: 0
      }
    },
    {
      id: "cmeics1qk0002wvjcrj35kkcv",
      title: "Sustainable Tech: Greener Tomorrow",
      description: "A hackathon focused on developing technology solutions for environmental sustainability, clean energy, and climate change.",
      theme: "Sustainability and Clean Technology",
      mode: "ONLINE",
      rules: "1. Teams of 1-5 members. 2. Projects must address one of the sustainable development goals. 3. Presentations will be judged on creativity and feasibility.",
      timeline: null,
      prizes: "1st Place: $3000, 2nd Place: $1500, Best Presentation: $500",
      sponsors: "EcoSolutions Inc.",
      startAt: "2025-11-15T10:00:00.000Z",
      endAt: "2025-11-17T18:00:00.000Z",
      organizerId: "user_somerandomid123",
      createdAt: "2025-08-20T10:00:00.000Z",
      updatedAt: "2025-08-20T10:00:00.000Z",
      organizer: {
        id: "user_somerandomid123",
        name: "Jane Doe",
        email: "jane.doe@example.com"
      },
      judges: [],
      _count: {
        registrations: 0,
        teams: 0
      }
    },
    {
      id: "cmeics1qk0003wvjcrj35kkcv",
      title: "Cybersecurity Fortress: The Codebreaker Challenge",
      description: "Test your skills in ethical hacking, network defense, and cryptography. A competitive hackathon for cybersecurity enthusiasts.",
      theme: "Cybersecurity and Network Defense",
      mode: "ONLINE",
      rules: "1. Individual participation only. 2. Must solve a series of security-related challenges. 3. Winner determined by fastest completion time.",
      timeline: null,
      prizes: "1st Place: $2000, 2nd Place: $1000, 3rd Place: $500",
      sponsors: "SecureCorp",
      startAt: "2025-12-01T12:00:00.000Z",
      endAt: "2025-12-03T12:00:00.000Z",
      organizerId: "user_anotherid456",
      createdAt: "2025-08-21T11:00:00.000Z",
      updatedAt: "2025-08-21T11:00:00.000Z",
      organizer: {
        id: "user_anotherid456",
        name: "John Smith",
        email: "john.smith@example.com"
      },
      judges: [],
      _count: {
        registrations: 0,
        teams: 0
      }
    }
  ],
};

// Main HackathonEventsPage component. This will be the content of the /events page.
export default function HackathonEventsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a ref to prevent multiple fetches during component re-renders.
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch data if it hasn't been fetched before.
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchHackathons();
    }
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      // Simulating a network request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch data from the actual API endpoint:
      // const response = await fetch('/api/events');
      // const result = await response.json();
      
      // Using dummy data for demonstration
      const result = dummyApiResponse;

      if (result.success) {
        setHackathons(result.data);
      } else {
        setError("Failed to fetch hackathons.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--background)] text-[var(--foreground)]">
        <p className="font-sans text-xl">Loading hackathons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--background)] text-destructive">
        <p className="font-sans text-xl">Error: {error}</p>
      </div>
    );
  }
  
  return (
  <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col items-center p-4 m-4">
    <main className="w-full max-w-6xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] text-center mb-12 p-4 translate-y-5">
        Explore Hackathons
      </h1>
      <div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {hackathons.length > 0 ? (
          hackathons.map((hackathon) => (
            <div key={hackathon.id} className="card bg-[var(--card)] overflow-hidden m-5">
              <div className="p-6 md:p-8 flex flex-col h-full">
                <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 mb-4 self-start rounded-none border border-border">
                  {hackathon.mode}
                </span>
                <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-2">
                  {hackathon.title}
                </h2>
                <p className="text-[var(--muted-foreground)] text-sm mb-4 flex-grow">
                  {hackathon.description}
                </p>
                <div className="text-sm">
                  <p className="mb-2">
                    <span className="font-semibold text-[var(--muted)]">Theme:</span> {hackathon.theme}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold text-[var(--muted)]">Organized by:</span> {hackathon.organizer.name}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold text-[var(--muted)]">Prizes:</span> {hackathon.prizes}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--muted)]">Dates:</span> {formatDate(hackathon.startAt)} - {formatDate(hackathon.endAt)}
                  </p>
                </div>
                <button className="button mt-6 w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center">
            <p className="text-[var(--muted-foreground)] text-lg">No hackathons available at the moment. Check back later!</p>
          </div>
        )}
      </div>
    </main>
  </div>
);
}
