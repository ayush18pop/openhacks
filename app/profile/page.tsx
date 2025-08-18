"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const [step, setStep] = useState<"role" | "questions">("role");
  const [role, setRole] = useState<"PARTICIPANT" | "ORGANISER" | "JUDGE" | null>(null);
  const [answers, setAnswers] = useState<any>({});

  function handleRoleSelect(selected: "PARTICIPANT" | "ORGANISER" | "JUDGE") {
    setRole(selected);
    setStep("questions");
  }

  async function handleSubmit() {
    await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({ role, answers }),
      headers: { "Content-Type": "application/json" },
    });
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <Card className="w-full max-w-lg bg-neutral-950 border-white/10 text-white">
        <CardHeader>
          <CardTitle>
            {step === "role" ? "Choose your role" : `Questions for ${role}`}
          </CardTitle>
          <CardDescription className="text-white/70">
            {step === "role"
              ? "Tell us how you’re joining SynapHack."
              : "Fill in some details to personalise your experience."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "role" && (
            <div className="grid gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => handleRoleSelect("PARTICIPANT")}
              >
                Join as Participant
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => handleRoleSelect("ORGANISER")}
              >
                Join as Organiser
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => handleRoleSelect("JUDGE")}
              >
                Join as Judge
              </Button>
            </div>
          )}

          {step === "questions" && (
            <form className="grid gap-4">
              {role === "PARTICIPANT" && (
                <>
                  <div className="grid gap-2">
                    <Label>Skillset</Label>
                    <Input
                      placeholder="e.g. Frontend, Backend, ML"
                      onChange={(e) => setAnswers({ ...answers, skillset: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Preferred Track</Label>
                    <Input
                      placeholder="e.g. FinTech, AI, Web3"
                      onChange={(e) => setAnswers({ ...answers, track: e.target.value })}
                    />
                  </div>
                </>
              )}

              {role === "ORGANISER" && (
                <>
                  <div className="grid gap-2">
                    <Label>Organisation Name</Label>
                    <Input
                      placeholder="Your organisation"
                      onChange={(e) => setAnswers({ ...answers, organisation: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Idea</Label>
                    <Input
                      placeholder="Describe your event"
                      onChange={(e) => setAnswers({ ...answers, eventIdea: e.target.value })}
                    />
                  </div>
                </>
              )}

              {role === "JUDGE" && (
                <>
                  <div className="grid gap-2">
                    <Label>Area of Expertise</Label>
                    <Input
                      placeholder="e.g. AI, Design, Entrepreneurship"
                      onChange={(e) => setAnswers({ ...answers, expertise: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
                      onChange={(e) => setAnswers({ ...answers, experience: e.target.value })}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleSubmit} className="mt-4">
                Save Profile
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
