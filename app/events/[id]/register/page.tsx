"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { 
  useEvent, 
  useRegistrationStatus, 
  useTeams, 
  useMyInvites, 
  useRegisterForEvent, 
  useCreateTeam, 
  useRespondToInvite,
  useCreateInvite,
  useRemoveMember
} from "../../../../hooks/useHackathonData";
import { findUserByEmail } from "../../../../hooks/useTeams";

import { Users, Plus, Mail, Trash2, Check, X } from "lucide-react";
import { Button } from "../../../../components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/retroui/Card";
import { Input } from "../../../../components/retroui/Input";

type Event = { id: string; title: string; rules?: string | null; startAt: string; endAt: string; };
type Team = { id: string; name: string; ownerId: string; members: { id: string; name: string | null }[] };
type Invite = { id: string; team: { name: string } };

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md text-white ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { userId } = useAuth();

  const [agreed, setAgreed] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { data: regStatus, isLoading: regLoading } = useRegistrationStatus(eventId);
  const { data: teamsData, isLoading: teamsLoading } = useTeams(eventId);
  const { data: invitesData, isLoading: invitesLoading } = useMyInvites();

  const registerMutation = useRegisterForEvent(eventId);
  const createTeamMutation = useCreateTeam();
  const respondInviteMutation = useRespondToInvite();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRegister = () => {
    setError(null);
    if (!agreed) {
      setError("You must accept the rules to continue.");
      showToast("Please accept the rules first!", "error");
      return;
    }
    registerMutation.mutate(undefined, {
      onSuccess: () => showToast("Registration successful!", "success"),
      onError: (err) => {
        setError((err as Error).message);
        showToast("Registration failed. Please try again.", "error");
      },
    });
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      showToast("Please enter a team name!", "error");
      return;
    }
    createTeamMutation.mutate({ eventId, name: teamName.trim() }, {
      onSuccess: () => {
        setTeamName("");
        showToast("Team created successfully!", "success");
      },
      onError: (err) => {
        setError((err as Error).message);
        showToast("Failed to create team.", "error");
      },
    });
  };

  const event: Event | undefined = eventData?.data;
  const isRegistered: boolean = regStatus?.isRegistered;
  const teams: Team[] = teamsData?.data || [];
  const invites: Invite[] = invitesData?.data || [];
  const isLoading = eventLoading || regLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <p className="text-gray-600">The event you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-600">
              {isRegistered 
                ? "You're registered! Manage your team below." 
                : `Starts ${new Date(event.startAt).toLocaleDateString()}`
              }
            </p>
          </div>

          {!isRegistered ? (
            <div className="space-y-6">
              {event.rules && (
                <Card>
                  <CardHeader>
                    <CardTitle>Event Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-60 overflow-y-auto p-4 bg-gray-50 rounded border text-sm">
                      <pre className="whitespace-pre-wrap">{event.rules}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Register for Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1" 
                      checked={agreed} 
                      onChange={(e) => setAgreed(e.target.checked)} 
                    />
                    <span>I have read and accept the event rules</span>
                  </label>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleRegister} 
                    disabled={registerMutation.isPending || !agreed}
                    className="w-full"
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Teams */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Teams
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Create Team */}
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Team name" 
                        value={teamName} 
                        onChange={(e) => setTeamName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
                      />
                      <Button 
                        onClick={handleCreateTeam} 
                        disabled={createTeamMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-1"/> 
                        Create
                      </Button>
                    </div>

                    {/* Teams List */}
                    {teamsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : teams.length > 0 ? (
                      <div className="space-y-4">
                        {teams.map(team => (
                          <TeamCard 
                            key={team.id} 
                            team={team} 
                            currentUserId={userId} 
                            eventId={eventId}
                            onToast={showToast}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No teams yet. Create the first one!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Invitations */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Invitations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invitesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : invites.length > 0 ? (
                      <div className="space-y-3">
                        {invites.map(invite => (
                          <div key={invite.id} className="p-3 border rounded">
                            <p className="font-medium text-sm mb-2">{invite.team.name}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  respondInviteMutation.mutate({ inviteId: invite.id, action: 'ACCEPT' });
                                  showToast("Joined team!", "success");
                                }}
                                className="flex-1"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  respondInviteMutation.mutate({ inviteId: invite.id, action: 'DECLINE' });
                                  showToast("Invite declined.", "info");
                                }}
                                className="flex-1"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No pending invitations
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TeamCard({ 
  team, 
  currentUserId, 
  eventId, 
  onToast 
}: { 
  team: Team; 
  currentUserId: string | null | undefined; 
  eventId: string;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const queryClient = useQueryClient();

  const createInviteMutation = useCreateInvite();
  const removeMemberMutation = useRemoveMember();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      onToast("Please enter an email address!", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      onToast("Please enter a valid email address!", "error");
      return;
    }
    try {
      const result = await findUserByEmail(inviteEmail);
      if (result.success && result.data?.id) {
        createInviteMutation.mutate({ teamId: team.id, inviteeId: result.data.id }, {
          onSuccess: () => {
            setInviteEmail('');
            onToast("Invite sent!", "success");
          },
          onError: () => onToast("Failed to send invite.", "error")
        });
      } else {
        onToast("No user found with that email.", "error");
      }
    } catch {
      onToast("Error sending invite.", "error");
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    removeMemberMutation.mutate({ teamId: team.id, memberId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams', eventId] });
        onToast(`${memberName} removed from team.`, "info");
      },
      onError: () => onToast("Failed to remove member.", "error")
    });
  };

  const isOwner = team.ownerId === currentUserId;

  return (
    <div className="border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{team.name}</h3>
        {isOwner && <span className="text-xs text-gray-500">Owner</span>}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">Members ({team.members.length})</p>
          <div className="space-y-1">
            {team.members.map(member => (
              <div key={member.id} className="flex justify-between items-center text-sm">
                <span>
                  {member.name || 'Unknown User'}
                  {team.ownerId === member.id && <span className="text-xs text-gray-500 ml-1">(Owner)</span>}
                </span>
                {isOwner && team.ownerId !== member.id && (
                  <button 
                    onClick={() => handleRemoveMember(member.id, member.name || 'Member')} 
                    disabled={removeMemberMutation.isPending}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <Input 
              placeholder="member@email.com" 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
              className="text-sm"
            />
            <Button 
              onClick={handleInvite} 
              disabled={createInviteMutation.isPending}
              size="sm"
            >
              <Mail className="w-3 h-3 mr-1"/>
              Invite
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}