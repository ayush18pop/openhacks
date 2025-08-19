import { auth } from "@clerk/nextjs/server" // if you’re using Clerk for auth
import { prisma } from "../../src/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/retroui/Card"
import { Text } from "../../components/retroui/Text"
import { Badge } from "../../components/retroui/Badge"
import { Button } from "../../components/retroui/Button"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Text as="p" className="text-muted-foreground">
          Please log in to view your dashboard.
        </Text>
      </div>
    )
  }

  // Fetch user and stats
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   include: {
  //     registrations: true,
  //     organizedEvents: true,
  //     judgedEvents: true,
  //     memberOfTeams: {
  //       include: {
  //         event: true,
  //       },
  //     },
  //   },
  // })
//dummy data as of now
  const user = {
    id: userId,
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null,
    university: "Example University",
    website: "https://johndoe.com",
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    registrations: [],
    organizedEvents: [],
    judgedEvents: [],
    memberOfTeams: [],
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Text as="p" className="text-muted-foreground">User not found.</Text>
      </div>
    )
  }

  // Stats
  const hackathonsParticipated = user.registrations.length
  const hackathonsHosted = user.organizedEvents.length
  const hackathonsJudged = user.judgedEvents.length

  // Wins → assume you store winning info in Team or Registration (can be extended later)
  const wins = user.memberOfTeams.filter(team =>
    team.name.toLowerCase().includes("winner") // placeholder logic
  ).length

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 space-y-10">
      {/* Profile Card */}
      <Card className="p-6 bg-card border-border shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src="/retro-pixel-avatar.png"
            alt={user.name ?? "Avatar"}
            className="w-24 h-24 rounded-full border-2 border-border shadow-sm"
          />
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-bold text-foreground">{user.name ?? "Anonymous"}</CardTitle>
            <Text className="text-muted-foreground">{user.email}</Text>
            {user.university && (
              <Text className="text-sm text-muted-foreground">🎓 {user.university}</Text>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                {user.website}
              </a>
            )}
            <div className="flex gap-2 mt-2">
              {user.github && <Badge variant="default">GitHub</Badge>}
              {user.linkedin && <Badge variant="default">LinkedIn</Badge>}
              {user.twitter && <Badge variant="default">Twitter</Badge>}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-4 text-center shadow-md">
          <CardTitle className="text-lg">Participated</CardTitle>
          <CardContent>
            <Text className="text-3xl font-bold text-primary">{hackathonsParticipated}</Text>
          </CardContent>
        </Card>
        <Card className="p-4 text-center shadow-md">
          <CardTitle className="text-lg">Hosted</CardTitle>
          <CardContent>
            <Text className="text-3xl font-bold text-primary">{hackathonsHosted}</Text>
          </CardContent>
        </Card>
        <Card className="p-4 text-center shadow-md">
          <CardTitle className="text-lg">Judged</CardTitle>
          <CardContent>
            <Text className="text-3xl font-bold text-primary">{hackathonsJudged}</Text>
          </CardContent>
        </Card>
        <Card className="p-4 text-center shadow-md">
          <CardTitle className="text-lg">Wins</CardTitle>
          <CardContent>
            <Text className="text-3xl font-bold text-primary">{wins}</Text>
          </CardContent>
        </Card>
      </div>

      {/* Extra Info */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl">About</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground">{user.bio ?? "No bio added yet."}</Text>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-end">
        <Button variant="outline" className="px-6">
          Edit Profile
        </Button>
      </div>
    </main>
  )
}
