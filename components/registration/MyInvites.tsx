import { useMyInvites, useRespondToInvite } from '../../hooks/useHackathonData';
import { Button } from '../retroui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../retroui/Card';

export default function MyInvites() {
  const { data: invitesData, isLoading } = useMyInvites();
  const respondToInvite = useRespondToInvite();

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle style={{ textShadow: 'none' }}>My Invitations</CardTitle>
        <CardDescription>Respond to pending team invites.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p>Loading invites...</p>}
        {invitesData?.data.length > 0 ? (
          invitesData.data.map(invite => (
            <div key={invite.id} className="flex items-center justify-between gap-2 border-2 p-2">
              <span className="font-semibold text-sm">{invite.team.name}</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respondToInvite.mutate({ inviteId: invite.id, action: 'ACCEPT' })}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => respondToInvite.mutate({ inviteId: invite.id, action: 'DECLINE' })}>Decline</Button>
              </div>
            </div>
          ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-sm">You have no pending invitations.</p>
        )}
      </CardContent>
    </Card>
  );
}