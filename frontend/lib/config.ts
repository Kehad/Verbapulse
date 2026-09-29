export function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://verbapulse-1.onrender.com';
    }
  }
  return 'http://localhost:8000';
}

export function getWsUrl(path: string = '/ws/voice-conversation'): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const baseWs = process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, '');
    if (baseWs.startsWith('ws://') || baseWs.startsWith('wss://')) {
      return baseWs.includes('/ws/') ? baseWs : `${baseWs}${path.startsWith('/') ? path : '/' + path}`;
    }
  }
  const httpUrl = getBackendUrl();
  const wsProtocol = httpUrl.startsWith('https') ? 'wss' : 'ws';
  const host = httpUrl.replace(/^https?:\/\//, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `${wsProtocol}://${host}${cleanPath}`;
}
