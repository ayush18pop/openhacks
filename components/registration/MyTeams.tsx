import { useState } from 'react';
import { useTeams, useCreateTeam } from '../../hooks/useHackathonData';
import { Button } from '../retroui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../retroui/Card';
import { Input } from '../retroui/Input';
import { Label } from '../retroui/Label';
import { Plus, MailCheck, Users } from 'lucide-react';
// Assuming a hook to find users by email exists
// import { findUserByEmail } from '../../hooks/useTeams'; 

export default function MyTeams({ eventId }) {
  const [teamName, setTeamName] = useState('');
  const [inviteEmails, setInviteEmails] = useState<{ [key: string]: string }>({});
  
  const { data: teamsData, isLoading: teamsLoading } = useTeams(eventId);
  const createTeam = useCreateTeam();
  // Note: createInvite hook needs teamId, so it's called inside the map
  
  const handleCreateTeam = () => {
    if (!teamName) return;
    createTeam.mutate({ eventId, name: teamName }, {
      onSuccess: () => setTeamName(''),
    });
  };

  const handleInvite = (teamId: string) => {
    const email = inviteEmails[teamId];
    if (!email) return;
    // Here you would find the user by email first, then call the mutation
    console.log(`Inviting ${email} to team ${teamId}`);
    // findUserByEmail(email).then(user => {
    //   if (user.success) {
    //     createInviteMutation.mutate({ inviteeId: user.data.id });
    //   }
    // });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle style={{ textShadow: 'none' }}>Create a Team</CardTitle>
          <CardDescription>Assemble your crew for the hackathon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input id="teamName" placeholder="e.g., The Code Crusaders" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            <Button onClick={handleCreateTeam} disabled={createTeam.isPending}>
              <Plus className="w-4 h-4 mr-1"/> {createTeam.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {teamsLoading && <p>Loading your teams...</p>}
      
      {teamsData?.data.map((team) => (
        <Card key={team.id}>
            <CardHeader>
                <CardTitle style={{ textShadow: 'none' }}>{team.name}</CardTitle>
                <CardDescription>Owner: {team.owner.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Members</Label>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {team.members.map(m => <li key={m.id}>{m.name}</li>)}
                    </ul>
                </div>
                <div>
                    <Label htmlFor={`invite-${team.id}`}>Invite a Member</Label>
                    <div className="flex gap-2 mt-1">
                        <Input id={`invite-${team.id}`} placeholder="member@email.com" value={inviteEmails[team.id] || ''} onChange={e => setInviteEmails({...inviteEmails, [team.id]: e.target.value})}/>
                        <Button onClick={() => handleInvite(team.id)}>
                            <MailCheck className="w-4 h-4 mr-1"/> Invite
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}