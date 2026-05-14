const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();

  // Clean up expired entries
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
