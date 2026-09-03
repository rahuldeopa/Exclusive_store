const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://seasonsforchangeapi.rahuldeopa.dev/api' : 'http://localhost:4000/api');

export const getBookContent = async (passcode) => {
  const response = await fetch(`${API_URL}/book/${passcode}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

export const getBookVideos = async (passcode) => {
  const response = await fetch(`${API_URL}/book/videos/${passcode}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

export const getBookAudio = async (passcode) => {
  const response = await fetch(`${API_URL}/book/audio/${passcode}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};
