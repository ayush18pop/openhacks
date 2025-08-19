"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs"; // Import useAuth to get the current user ID
import { 
  useEvent, 
  useRegistrationStatus, 
  useTeams, 
  useMyInvites, 
  useRegisterForEvent, 
  useCreateTeam, 
  useRespondToInvite,
  useCreateInvite,
  useRemoveMember // Assuming you add this to your hooks file
} from "../../../hooks/useHackathonData"; // Adjust path if needed

import { Users, Plus, MailCheck, Trash2 } from "lucide-react";
import {Button}  from "../../../components/retroui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/retroui/Card";
import { Text } from "../../../components/retroui/Text";
import { Input } from "../../../components/retroui/Input";
import { Label } from "../../../components/retroui/Label";

// --- Type Definitions ---
type Event = { id: string; title: string; rules?: string | null; startAt: string; endAt: string; };
type Team = { id: string; name: string; ownerId: string; members: { id: string; name: string | null }[] };
type Invite = { id: string; team: { name: string } };

export default function RegistrationPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { userId } = useAuth(); // Get the current user's ID from Clerk

  // --- Local UI State ---
  const [agreed, setAgreed] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching Hooks ---
  const { data: eventData, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { data: regStatus, isLoading: regLoading } = useRegistrationStatus(eventId);
  const { data: teamsData, isLoading: teamsLoading } = useTeams(eventId);
  const { data: invitesData, isLoading: invitesLoading } = useMyInvites();

  // --- Mutation Hooks ---
  const registerMutation = useRegisterForEvent(eventId);
  const createTeamMutation = useCreateTeam();
  const respondInviteMutation = useRespondToInvite();
  
  // --- Event Handlers ---
  const handleRegister = () => {
    setError(null);
    if (!agreed) {
      setError("You must accept the rules to continue.");
      return;
    }
    registerMutation.mutate(undefined, {
      onError: (err) => setError((err as Error).message),
    });
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    createTeamMutation.mutate({ eventId, name: teamName.trim() }, {
        onSuccess: () => setTeamName(""),
        onError: (err) => setError((err as Error).message),
    });
  };

  // --- Derived State ---
  const event: Event | undefined = eventData?.data;
  const isRegistered: boolean = regStatus?.isRegistered;
  const teams: Team[] = teamsData?.data || [];
  const invites: Invite[] = invitesData?.data || [];
  const isLoading = eventLoading || regLoading;

  // --- Render Logic ---
  if (isLoading) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading Registration...</div>;
  }
  if (eventError) {
    return <div className="min-h-[60vh] grid place-items-center text-destructive">Error: {(eventError as Error).message}</div>;
  }
  if (!event) {
    return <div className="min-h-[60vh] grid place-items-center">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="container mx-auto px-4 py-8 md:py-12">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl">{isRegistered ? "You are Registered for" : "Register for"} {event.title}</h1>
            <p className="text-muted-foreground mt-2">
                {isRegistered ? "What's next? Create a team or join one below." : `Join the brightest minds from ${new Date(event.startAt).toLocaleDateString()}`}
            </p>
        </div>

        {!isRegistered ? (
            // --- REGISTRATION FORM ---
            <div className="max-w-3xl mx-auto space-y-8">
                {event.rules && (
                    <Card>
                        <CardHeader><CardTitle style={{ textShadow: 'none' }}>Rules & Code of Conduct</CardTitle></CardHeader>
                        <CardContent className="max-h-60 overflow-y-auto"><Text className="text-muted-foreground whitespace-pre-wrap">{event.rules}</Text></CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle style={{ textShadow: 'none' }}>Confirm Your Spot</CardTitle>
                        <CardDescription>By clicking register, you agree to the terms above.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input id="agree" type="checkbox" className="size-4 border-2" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                            <Label htmlFor="agree">I have read and agree to the rules and code of conduct.</Label>
                        </div>
                        {error && <Text className="text-sm text-destructive-foreground bg-destructive p-2">{error}</Text>}
                        <Button onClick={handleRegister} disabled={registerMutation.isPending} className="w-full">
                            {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        ) : (
            // --- TEAM DASHBOARD ---
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* My Teams Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle style={{ textShadow: 'none' }}>My Teams</CardTitle>
                            <CardDescription>Create a new team or manage your existing ones.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="teamName">Create a New Team</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input id="teamName" placeholder="e.g., The Code Crusaders" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                                    <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
                                        <Plus className="w-4 h-4 mr-1"/> {createTeamMutation.isPending ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                            <div className="h-px w-full bg-[var(--border)]" />
                            {teamsLoading ? <p>Loading teams...</p> : teams.length > 0 ? (
                                <div className="space-y-4">
                                    {teams.map(team => <TeamCard key={team.id} team={team} currentUserId={userId} eventId={eventId} />)}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">You are not part of any team yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <aside className="lg:col-span-2">
                    {/* My Invites Section */}
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle style={{ textShadow: 'none' }}>My Invitations</CardTitle>
                            <CardDescription>Respond to pending team invites.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {invitesLoading ? <p>Loading invites...</p> : invites.length > 0 ? (
                                invites.map(invite => (
                                    <div key={invite.id} className="flex items-center justify-between gap-2 border-2 p-2">
                                        <span className="font-semibold text-sm">{invite.team.name}</span>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => respondInviteMutation.mutate({ inviteId: invite.id, action: 'ACCEPT' })}>Accept</Button>
                                            <Button size="sm" variant="outline" onClick={() => respondInviteMutation.mutate({ inviteId: invite.id, action: 'DECLINE' })}>Decline</Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm text-center py-4">You have no pending invitations.</p>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-component for displaying a single team ---
function TeamCard({ team, currentUserId, eventId }: { team: Team, currentUserId: string | null | undefined, eventId: string }) {
    const [inviteEmail, setInviteEmail] = useState('');
    const queryClient = useQueryClient();

    // These mutations are specific to this team instance
    const createInviteMutation = useCreateInvite();
    const removeMemberMutation = useRemoveMember();

    const handleInvite = () => {
        if (!inviteEmail) return;
        // This is a placeholder for finding a user by email.
        // You would need an API route: GET /api/users?email=...
        console.log(`Finding user with email: ${inviteEmail}`);
        // Example: findUserByEmail(inviteEmail).then(user => {
        //   if (user) createInviteMutation.mutate({ inviteeId: user.id });
        // });
    };

    const handleRemoveMember = (memberId: string) => {
        removeMemberMutation.mutate({ teamId: team.id, memberId }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['teams', eventId] });
            }
        });
    };

    const isOwner = team.ownerId === currentUserId;

    return (
        <div className="border-2 border-[var(--border)] p-4 space-y-4">
            <h3 className="font-bold text-lg">{team.name}</h3>
            <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Members</h4>
                <ul className="space-y-2">
                    {team.members.map(member => (
                        <li key={member.id} className="flex justify-between items-center text-sm ml-6">
                            <span>{member.name} {team.ownerId === member.id && <span className="text-xs text-primary font-semibold">(Owner)</span>}</span>
                            {isOwner && team.ownerId !== member.id && (
                                <Button size="sm" variant="outline" className="p-1 h-auto" onClick={() => handleRemoveMember(member.id)} disabled={removeMemberMutation.isPending}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {isOwner && (
                <div>
                    <Label htmlFor={`invite-${team.id}`} className="text-sm font-semibold">Invite a Member</Label>
                    <div className="flex gap-2 mt-1">
                        <Input id={`invite-${team.id}`} placeholder="member@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                        <Button onClick={handleInvite} disabled={createInviteMutation.isPending} className="shrink-0">
                            <MailCheck className="w-4 h-4 mr-1"/> Invite
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
