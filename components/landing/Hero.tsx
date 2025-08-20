import Link from "next/link";
import Image from "next/image";
import { prisma } from "../../src/lib/prisma";
import { Button } from "../../components/retroui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/retroui/Card";
import { Badge } from "../../components/retroui/Badge";
import { ArrowRight, Star, Users } from "lucide-react";

const getEventStatus = (startAt: Date, endAt: Date) => {
  const now = new Date();
  if (now < startAt) return "Open";
  if (now >= startAt && now <= endAt) return "Live";
  return "Finished";
};

export default async function Hero() {
  // Find the upcoming event with the most registrations
  const featuredEvent = await prisma.event.findFirst({
    where: {
      startAt: {
        gte: new Date(),
      },
    },
    orderBy: [
        {
            registrations: {
                _count: 'desc',
            },
        },
        {
            startAt: 'asc'
        }
    ],
    include: {
        _count: {
            select: { registrations: true }
        }
    }
  });

  return (
    <section className="container mx-auto px-4 py-24 sm:py-32 text-center">
      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl">
        Host. Build. <span className="text-primary">Ship.</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
        The ultimate platform to create, manage, and participate in hackathons. All the tools you need, none of the fluff.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <Link href="/events">
          <Button size="lg">Browse Events</Button>
        </Link>
        <Link href="/events/create">
          <Button size="lg" variant="secondary">Create Event</Button>
        </Link>
      </div>

      {/* Featured Event Section */}
      <div className="mt-20">
        {featuredEvent ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 font-bold flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Most Popular Event
            </div>
            <Card className="shadow-lg text-left transition-all duration-300 hover:shadow-xl overflow-hidden">
              {featuredEvent.thumbnail && (
                <div className="relative h-52 w-full">
                    <Image 
                        src={featuredEvent.thumbnail}
                        alt={`${featuredEvent.title} thumbnail`}
                        fill
                        className="object-cover"
                    />
                </div>
              )}
              <CardHeader className="flex flex-row justify-between items-start">
                <CardTitle className="text-2xl">{featuredEvent.title}</CardTitle>
                <Badge>{getEventStatus(featuredEvent.startAt, featuredEvent.endAt)}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-muted-foreground mb-4">
                    <p className="text-sm">
                        {featuredEvent.description.substring(0, 120)}...
                    </p>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <Users className="w-5 h-5"/>
                        <span className="font-bold text-foreground">{featuredEvent._count.registrations}</span>
                    </div>
                </div>
                <Link href={`/events/${featuredEvent.id}`}>
                  <Button className="w-full">
                    View Event <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-dashed">
              <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No upcoming events scheduled. Check back soon or create your own!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
