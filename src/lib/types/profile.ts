// API Response types for profile endpoints - Updated for event-based authorization

export interface ProfileResponse {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  skills: string[];
  university: string | null;
  graduationYear: number | null;
  createdAt: Date;
  updatedAt: Date;
  // Event-based statistics
  stats: {
    registrations: number;
    organizedEvents: number;
    judgedEvents: number;
  };
  // Recent event relationships
  recentOrganizedEvents: Array<{
    id: string;
    title: string;
    startAt: Date;
  }>;
  recentJudgedEvents: Array<{
    id: string;
    title: string;
    startAt: Date;
  }>;
}

export interface ProfileUpdateRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  skills?: string[];
  university?: string;
  graduationYear?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DeleteAccountDependencies {
  organizedEvents: number;
  ownedTeams: number;
}

export type EventRole = 'PARTICIPANT' | 'JUDGE' | 'ORGANIZER';
