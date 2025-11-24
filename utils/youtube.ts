export function getYoutubeThumbnail(url: string) {
  try {
    const id = url.split('v=')[1].split('&')[0];
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } catch {
    return null;
  }
}