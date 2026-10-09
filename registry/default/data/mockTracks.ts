export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  accentColor: string;
  notes?: unknown[];
}

export const TRACKS: Song[] = [
  {
    id: 'track-1',
    title: 'Midnight City Lights',
    artist: 'Aether Echo',
    duration: 184,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    accentColor: '#6366f1',
    notes: [1, 2, 3, 4],
  },
  {
    id: 'track-2',
    title: 'Solar Flare Groove',
    artist: 'Nova Drift',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    accentColor: '#f59e0b',
    notes: [2, 3, 4, 5],
  },
  {
    id: 'track-3',
    title: 'Velvet Horizon',
    artist: 'Kroma Sound',
    duration: 165,
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80',
    accentColor: '#ec4899',
    notes: [3, 4, 5, 6],
  },
];
