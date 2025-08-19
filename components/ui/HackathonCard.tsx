import { Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const generateGradient = (id: string) => {
  const colors = [
    ['#ff9966', '#ff5e62'],
    ['#00F260', '#0575E6'],
    ['#e1eec3', '#f05053'],
    ['#1488CC', '#2B32B2'],
    ['#FF8008', '#FFC837'],
    ['#DA4453', '#89216B'],
  ];
  const index = id.charCodeAt(id.length - 1) % colors.length;
  const [color1, color2] = colors?.[index] || ['#ccc', '#eee'];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

type Hackathon = {
  id: string;
  title: string;
  description: string;
  mode: string;
  startAt: string;
  endAt: string;
  thumbnail?: string | null;
  prizes?: string | null; // Ensure prizes can be null
  _count: {
    registrations: number;
  };
};

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startDate} - ${endDate}`;
};

export const HackathonCard = ({ hackathon }: { hackathon: Hackathon }) => (
  <Link href={`/events/${hackathon.id}`} className="block group">
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="relative h-40 w-full">
        {hackathon.thumbnail ? (
          <Image
            src={hackathon.thumbnail}
            alt={`${hackathon.title} banner`}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: generateGradient(hackathon.id) }}
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {hackathon.mode}
          </span>
          {hackathon.prizes && hackathon.prizes.trim() !== '' && (
            <span className="bg-yellow-500/80 backdrop-blur-sm text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {/* Display a concise version of the prize */}
              {hackathon.prizes.includes('$') ? hackathon.prizes.split(',')[0] : hackathon.prizes.substring(0, 20) + '...'}
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-[var(--card-foreground)] mb-2 truncate group-hover:text-[var(--foreground)] transition-colors">
          {hackathon.title}
        </h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-4 flex-grow">
          {hackathon.description.substring(0, 80)}...
        </p>
        <div className="mt-auto flex justify-between items-center text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDateRange(hackathon.startAt, hackathon.endAt)}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>{hackathon._count.registrations}</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export const CardSkeleton = () => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse">
    <div className="h-40 w-full bg-[var(--muted)]"></div>
    <div className="p-5 space-y-3">
      <div className="h-6 w-3/4 bg-[var(--muted)] rounded"></div>
      <div className="h-4 w-full bg-[var(--muted)] rounded"></div>
      <div className="h-4 w-5/6 bg-[var(--muted)] rounded"></div>
      <div className="flex justify-between mt-2">
        <div className="h-5 w-1/3 bg-[var(--muted)] rounded"></div>
        <div className="h-5 w-1/4 bg-[var(--muted)] rounded"></div>
      </div>
    </div>
  </div>
);