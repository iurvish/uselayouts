export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  accentColor: string;
  notes?: unknown[];
}
