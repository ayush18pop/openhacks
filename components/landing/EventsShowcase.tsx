import Link from "next/link";
import { prisma } from "../../src/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/retroui/Card";
import { ArrowRight } from "lucide-react";

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default async function EventsShowcase() {
  const upcomingEvents = await prisma.event.findMany({
    where: {
      startAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      startAt: 'asc',
    },
    take: 3,
  });

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl">Upcoming Events</h2>
        <Link href="/events" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
          Browse All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="block group">
            <Card
              className="border-2 border-border bg-card h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl pr-2">{event.title}</CardTitle>
                    <span className="text-xs text-primary-foreground bg-secondary font-bold px-2 py-1 whitespace-nowrap">
                        {event.mode}
                    </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground flex-grow">{event.theme || event.description.substring(0, 80) + '...'}</p>
                <div className="mt-4 pt-4 border-t-2 border-border text-sm font-bold text-foreground">
                  Starts: {formatDate(event.startAt)}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
