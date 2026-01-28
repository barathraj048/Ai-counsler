const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchDashboard(userId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/dashboard?userId=${userId}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard');
  }

  return res.json();
}
