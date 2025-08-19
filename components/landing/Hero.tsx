import Link from "next/link";
import { Button } from "../../components/retroui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/retroui/Card";
import { Badge } from "../../components/retroui/Badge";

export default function Hero() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl font-bold text-foreground glass-border">
            Host. Build. <span className="text-primary">Ship</span> faster.
          </h1>
          <p className="mt-4 text-muted-foreground glass-border">
            Create events, manage teams, accept submissions, and run judging — all in one platform.
          </p>

          <div className="mt-6 flex gap-3">
            <Link href="/events">
              <Button>Browse events</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Create event</Button>
            </Link>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>SynapHack 3.0</CardTitle>
              <Badge>Open</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                36-hour student hackathon with multiple tracks & mentorship.
              </p>
              <div className="mt-4">
                <Link href="/events/synaphack-3">
                  <Button>View event</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
