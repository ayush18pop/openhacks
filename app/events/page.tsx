"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Hackathon names
const hackathonNames = [
  "Code Crusaders",
  "Byte Me",
  "Pixel Pirates",
  "Infinite Loopers",
  "Hackstreet Boys",
  "Stack Hackers",
  "Cloud Commanders",
  "Debug Divas",
  "Algorithm Alchemists",
  "Byte Bandits",
  "Neural Net Ninjas",
  "Trojan Source",
  "Quantum Coders",
  "Hack to the Future",
  "Cache Us If You Can",
  "Boolean Brotherhood",
  "Campus Coders",
  "Dorm Devs",
  "The Debuggers",
  "Data Dreamers",
  "Digital Nomads",
  "Infinite Recursion",
  "Cache Me Outside",
  "Boolean Bunch",
  "Cloud Blaze",
  "HackFlare",
  "MindHackers",
  "QuantumCrew",
  "SparkShift",
  "LogicPulse",
]

// Helper function to generate random prize
const getRandomPrize = () => {
  const min = 1000
  const max = 100000
  return `$${(Math.floor(Math.random() * (max - min + 1)) + min).toLocaleString()}`
}

// Mock events
const mockEvents = hackathonNames.map((name, i) => ({
  id: `${i + 1}`,
  title: `Hackathon ${i + 1} - ${name}`,
  description: "A cutting-edge hackathon to showcase your skills and creativity.",
  mode: ["online", "offline", "hybrid"][i % 3],
  startAt: new Date(2025, 8, (i % 28) + 1).toDateString(),
  endAt: new Date(2025, 8, (i % 28) + 2).toDateString(),
  prize: getRandomPrize(),
}))

export default function EventsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-12 text-center text-foreground">
        Upcoming Hackathons
      </h1>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockEvents.map((event) => (
          <Card
            key={event.id}
            className="relative overflow-hidden border border-border bg-background/50 backdrop-blur-sm
  hover:scale-105 hover:shadow-2xl hover:border-foreground/30 transition-all duration-300"

          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                {event.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>

              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="text-foreground">
                  {event.mode}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {event.startAt} → {event.endAt}
                </span>
              </div>

              {/* Prize */}
              <p className="text-sm font-medium text-foreground">
                 Prize: {event.prize}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
