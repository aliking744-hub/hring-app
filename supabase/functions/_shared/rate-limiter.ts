// Simple in-memory rate limiter for edge functions
// Note: This is per-instance, so it won't work perfectly across multiple instances
// For production, consider using Redis or Supabase for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }
  
  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs
    };
  }
  
  if (entry.count >= config.maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: entry.resetTime - now
    };
  }
  
  entry.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  };
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Helper to get client identifier from request
export function getClientIdentifier(req: Request): string {
  // Try to get user ID from authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Use a hash of the token as identifier
    const token = authHeader.replace('Bearer ', '');
    return `auth:${simpleHash(token)}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}

// Simple hash function for tokens
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Pre-configured rate limit responses
export function rateLimitResponse(resetIn: number, corsHeaders: Record<string, string>) {
  const retryAfter = Math.ceil(resetIn / 1000);
  return new Response(
    JSON.stringify({ 
      error: 'محدودیت درخواست. لطفاً کمی صبر کنید.',
      retryAfter
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString()
      } 
    }
  );
}
