export function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}
