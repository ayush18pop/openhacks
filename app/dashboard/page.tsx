"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/retroui/Card";
import { Button } from "../../components/retroui/Button";
import { Text } from "../../components/retroui/Text";
import { Badge } from "../../components/retroui/Badge";
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Edit, 
  Trophy,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  TrendingUp,
  Award,
  Target,
  Zap,
  Heart,
  BookOpen,
  Activity
} from "lucide-react";

// --- Data Fetching Hook ---
const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'Failed to fetch dashboard data');
      }
      return res.json();
    },
  });
};

// --- Enhanced Loading Component ---
function LoadingDashboard() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      <Card className="p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-muted border-2 border-border shadow-md rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </div>
      </Card>
      <div className="h-12 bg-muted rounded"></div>
      <Card className="p-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    </main>
  );
}

// --- Stats Card Component ---
function StatsCard({ icon: Icon, title, value, subtitle, color = "default" }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "default" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    default: "border-border bg-card",
    success: "border-green-400 bg-green-50",
    warning: "border-yellow-400 bg-yellow-50", 
    danger: "border-red-400 bg-red-50"
  };

  return (
    <Card className={`p-6 transition-all hover:shadow-lg hover:scale-105 ${colorClasses[color]}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 border-2 border-border shadow-md bg-card rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <Text className="text-3xl font-bold mb-1">{value}</Text>
          <Text className="text-sm text-muted-foreground font-medium">{title}</Text>
          {subtitle && <Text className="text-xs text-muted-foreground">{subtitle}</Text>}
        </div>
      </div>
    </Card>
  );
}

// --- Quick Actions Component ---
function QuickActions({ activeTab }: { activeTab: string }) {
  const actions = {
    participant: [
      { icon: Plus, label: "Browse Events", href: "/events", color: "bg-blue-500" },
      { icon: Users, label: "Find Team", href: "/teams/find", color: "bg-green-500" },
      { icon: Trophy, label: "My Achievements", href: "/achievements", color: "bg-yellow-500" },
    ],
    organizer: [
      { icon: Plus, label: "Create Event", href: "/events/create", color: "bg-purple-500" },
      { icon: Users, label: "Invite Judges", href: "/judges/invite", color: "bg-indigo-500" },
      { icon: Activity, label: "Analytics", href: "/analytics", color: "bg-pink-500" },
    ],
    judge: [
      { icon: BookOpen, label: "Review Guide", href: "/judge/guide", color: "bg-cyan-500" },
      { icon: Star, label: "Past Reviews", href: "/judge/history", color: "bg-orange-500" },
      { icon: Award, label: "Certificates", href: "/certificates", color: "bg-red-500" },
    ]
  };

  const currentActions = actions[activeTab as keyof typeof actions] || actions.participant;

  return (
    <Card className="p-6">
      <CardTitle className="text-xl mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Quick Actions
      </CardTitle>
      <div className="grid grid-cols-1 gap-4">
        {currentActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-3 p-4 h-auto hover:scale-105 transition-transform justify-start"
            >
              <div className={`p-2 rounded-full ${action.color} text-white shrink-0`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// --- Recent Activity Component ---
function RecentActivity() {
  // This would typically come from your API
  const activities: Array<{
    icon: React.ElementType;
    text: string;
    time: string;
    color: string;
  }> = [];

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <CardTitle className="text-xl mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent Activity
        </CardTitle>
        <div className="text-center p-8">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <Text className="text-muted-foreground">No recent activity</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardTitle className="text-xl mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        Recent Activity
      </CardTitle>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <Text className="text-sm font-medium">{activity.text}</Text>
              <Text className="text-xs text-muted-foreground">{activity.time}</Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Main Dashboard Component ---
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('participant');
  const { data: response, isLoading, error } = useDashboardData();
  const { user: clerkUser } = useUser();
  const user = response?.data;

  if (isLoading) return <LoadingDashboard />;

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Card className="p-8 text-center border-red-400 bg-red-50">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <CardTitle className="text-red-800 mb-2">Something went wrong</CardTitle>
          <Text className="text-red-600 mb-4">{error.message}</Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">No Data Found</CardTitle>
          <Text className="text-muted-foreground mb-4">Unable to load your dashboard data.</Text>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </Card>
      </main>
    );
  }

  const stats = {
    participant: [
      { icon: Trophy, title: "Events Joined", value: user.registrations?.length || 0, subtitle: "This year" },
      { icon: Users, title: "Team Members", value: user.teamMembersCount || 0, subtitle: "Across all teams" },
      { icon: Award, title: "Wins", value: user.winsCount || 0, subtitle: "1st place finishes", color: "success" as const }
    ],
    organizer: [
      { icon: Calendar, title: "Events Created", value: user.organizedEvents?.length || 0, subtitle: "Total events" },
      { icon: Users, title: "Total Participants", value: user.organizedEvents?.reduce((acc: number, e: OrganizedEvent) => acc + e._count.registrations, 0) || 0, subtitle: "All time" },
      { icon: TrendingUp, title: "Success Rate", value: user.successRate || "0%", subtitle: "Event completion", color: "success" as const }
    ],
    judge: [
      { icon: BookOpen, title: "Events Judged", value: user.judgedEvents?.length || 0, subtitle: "Total reviews" },
      { icon: Star, title: "Avg Rating", value: user.avgRating || "0", subtitle: "From participants", color: "success" as const },
      { icon: Target, title: "Projects Reviewed", value: user.projectsReviewed || 0, subtitle: "All time" }
    ]
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Enhanced Profile Header */}
      <Card className="p-8 bg-gradient-to-r from-card to-muted/10 border-2 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="relative shrink-0">
            <img
              src={clerkUser?.imageUrl || '/default-avatar.png'}
              alt={clerkUser?.fullName || "Avatar"}
              className="w-32 h-32 border-4 border-border shadow-lg rounded-lg transition-transform hover:scale-105"
            />
            {user.level && (
              <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold text-sm px-2 py-1">
                Lvl {user.level}
              </Badge>
            )}
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
              <CardTitle className="text-4xl font-bold">{clerkUser?.fullName || user.name}</CardTitle>
            </div>
            <CardDescription className="text-lg mb-3">{clerkUser?.primaryEmailAddress?.emailAddress || user.email}</CardDescription>
            {user.university && (
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <BookOpen className="w-5 h-5" />
                <Text className="text-muted-foreground">{user.university}</Text>
              </div>
            )}
            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {user.badges.map((badge: string, index: number) => (
                  <Badge key={index} variant="default" className="px-3 py-1">{badge}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link href="/profile">
              <Button variant="outline" className="hover:scale-105 transition-transform min-w-[140px]">
                <Edit className="w-4 h-4 mr-2" /> 
                Edit Profile
              </Button>
            </Link>
            
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats[activeTab as keyof typeof stats].map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Enhanced Tab Navigation */}
      <Card className="p-4 w-full">
        <div className="flex flex-col sm:flex-row gap-2">
          {[
            { key: 'participant', label: 'Participant', icon: Users },
            { key: 'organizer', label: 'Organizer', icon: Calendar },
            { key: 'judge', label: 'Judge', icon: Trophy }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              onClick={() => setActiveTab(key)}
              className={`flex-1 transition-all duration-200 py-3 ${
                activeTab === key 
                  ? 'scale-105 shadow-lg' 
                  : 'hover:scale-102'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
              {key === 'participant' && user.registrations?.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {user.registrations.length}
                </Badge>
              )}
              {key === 'organizer' && user.organizedEvents?.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {user.organizedEvents.length}
                </Badge>
              )}
              {key === 'judge' && user.judgedEvents?.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {user.judgedEvents.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8">
          {activeTab === 'participant' && <ParticipantDashboard data={user.registrations || []} />}
          {activeTab === 'organizer' && <OrganizerDashboard data={user.organizedEvents || []} />}
          {activeTab === 'judge' && <JudgeDashboard data={user.judgedEvents || []} />}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <QuickActions activeTab={activeTab} />
          <RecentActivity />
        </div>
      </div>
    </main>
  );
}

// --- Enhanced Participant Tab Component ---
type ParticipantRegistration = {
  event: {
    id: string;
    title: string;
    startAt: string;
  };
};

function ParticipantDashboard({ data }: { data: ParticipantRegistration[] }) {
  if (data.length === 0) {
    return (
      <EmptyState 
        icon={Users}
        title="Ready to Join Your First Event?"
        message="Discover amazing hackathons and coding competitions happening around you."
        cta={{ href: '/events', text: 'Browse Events', icon: Plus }}
      />
    );
  }

  const upcomingEvents = data.filter(({ event }) => new Date(event.startAt) > new Date());
  const pastEvents = data.filter(({ event }) => new Date(event.startAt) <= new Date());

  return (
    <div className="space-y-8 w-full">
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card className="border-2 border-green-400 bg-green-50/50 w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-green-800 text-xl">
              <Clock className="w-6 h-6" />
              Upcoming Events ({upcomingEvents.length})
            </CardTitle>
            <CardDescription className="text-green-700">
              Events you&apos;re registered for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map(({ event }) => (
              <EventCard
                key={event.id}
                event={event}
                status="upcoming"
                actionHref={`/events/${event.id}/register`}
                actionText="Manage Team"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Trophy className="w-6 h-6" />
              Past Events ({pastEvents.length})
            </CardTitle>
            <CardDescription>
              Your hackathon history and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastEvents.map(({ event }) => (
              <EventCard
                key={event.id}
                event={event}
                status="completed"
                actionHref={`/events/${event.id}/results`}
                actionText="View Results"
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Enhanced Event Card Component ---
function EventCard({ 
  event, 
  status, 
  actionHref, 
  actionText, 
  participants 
}: {
  event: { id: string; title: string; startAt: string };
  status: 'upcoming' | 'completed';
  actionHref: string;
  actionText: string;
  participants?: number;
}) {
  const isUpcoming = status === 'upcoming';
  const eventDate = new Date(event.startAt);
  const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`border-2 border-border p-6 rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] ${
      isUpcoming ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-muted/30'
    }`}>
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className={`p-3 border-2 border-border shadow-md rounded-lg ${
              isUpcoming ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isUpcoming ? <Clock className="w-5 h-5 text-green-600" /> : <CheckCircle className="w-5 h-5 text-gray-600" />}
            </div>
            <div className="flex-1">
              <Text className="font-bold text-xl mb-2">{event.title}</Text>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {eventDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {isUpcoming && daysUntil > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}
                  </Badge>
                )}
                {participants && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {participants} participants
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Link href={actionHref}>
          <Button className="hover:scale-105 transition-transform whitespace-nowrap">
            {actionText} 
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// --- Enhanced Organizer Tab Component ---
type OrganizedEvent = {
  id: string;
  title: string;
  _count: {
    registrations: number;
  };
};

function OrganizerDashboard({ data }: { data: OrganizedEvent[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Ready to Create Your First Event?"
        message="Start building amazing experiences for the developer community."
        cta={{ href: '/events/create', text: 'Create Event', icon: Plus }}
      />
    );
  }

  return (
    <Card className="border-2 w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Calendar className="w-6 h-6" />
          My Organized Events ({data.length})
        </CardTitle>
        <CardDescription>
          Manage and monitor your events&apos; performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map(event => (
          <div key={event.id} className="border-2 border-border p-6 rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 border-2 border-border shadow-md rounded-lg bg-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <Text className="font-bold text-xl mb-2">{event.title}</Text>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {event._count.registrations} Participants
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/events/${event.id}/manage`}>
                <Button className="hover:scale-105 transition-transform">
                  Manage Event 
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Enhanced Judge Tab Component ---
type JudgedEvent = {
  id: string;
  title: string;
  startAt: string;
};

function JudgeDashboard({ data }: { data: JudgedEvent[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No Judging Assignments Yet"
        message="You haven't been invited to judge any events. Build your profile to get noticed!"
        cta={{ href: '/profile', text: 'Update Profile', icon: Edit }}
      />
    );
  }

  return (
    <Card className="border-2 w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Trophy className="w-6 h-6" />
          My Judging Assignments ({data.length})
        </CardTitle>
        <CardDescription>
          Review and evaluate amazing projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map(event => (
          <EventCard
            key={event.id}
            event={event}
            status={new Date(event.startAt) > new Date() ? 'upcoming' : 'completed'}
            actionHref={`/events/${event.id}/judge`}
            actionText="View Submissions"
          />
        ))}
      </CardContent>
    </Card>
  );
}

// --- Enhanced Empty State Component ---
function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  cta 
}: { 
  icon: React.ElementType;
  title: string;
  message: string; 
  cta?: { href: string; text: string; icon: React.ElementType };
}) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-16 text-center">
        <div className="p-6 border-2 border-border shadow-md rounded-full bg-muted/50 mb-6">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-3 mb-6">
          <Text className="font-bold text-2xl">{title}</Text>
          <Text className="text-muted-foreground max-w-md text-lg">{message}</Text>
        </div>
        {cta && (
          <Link href={cta.href}>
            <Button className="hover:scale-105 transition-transform text-lg px-6 py-3">
              <cta.icon className="w-5 h-5 mr-2" />
              {cta.text}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}