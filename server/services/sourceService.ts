import { SourceItem } from '../types.js';

// SSRF Protection: validate URL protocol and prevent private / internal IP calls
export function isSafePublicUrl(urlString: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlString);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Only http and https protocols are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and standard loopback hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { safe: false, reason: 'Access to localhost and internal hostnames is prohibited for security.' };
    }

    // Block AWS/GCP/Azure metadata services
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { safe: false, reason: 'Access to cloud instance metadata services is blocked.' };
    }

    // Block RFC1918 private IPv4 ranges:
    // 10.0.0.0/8
    // 172.16.0.0/12
    // 192.168.0.0/16
    // 127.0.0.0/8
    // 169.254.0.0/16 (link-local)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);

      if (octet1 === 10) {
        return { safe: false, reason: 'Private IP range 10.x.x.x is prohibited.' };
      }
      if (octet1 === 127) {
        return { safe: false, reason: 'Loopback IP range 127.x.x.x is prohibited.' };
      }
      if (octet1 === 169 && octet2 === 254) {
        return { safe: false, reason: 'Link-local IP range 169.254.x.x is prohibited.' };
      }
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
        return { safe: false, reason: 'Private IP range 172.16-31.x.x is prohibited.' };
      }
      if (octet1 === 192 && octet2 === 168) {
        return { safe: false, reason: 'Private IP range 192.168.x.x is prohibited.' };
      }
      if (octet1 === 0) {
        return { safe: false, reason: 'Invalid address 0.x.x.x.' };
      }
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: `Malformed URL format: ${err?.message || 'Invalid syntax'}` };
  }
}

// Extract HTML title, dates, cycles, and readable text
export function extractContentFromHtml(html: string, sourceUrl: string): {
  title: string;
  text: string;
  publishedDate: string | null;
  cycleInfo: string | null;
} {
  // Extract Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    title = h1Match ? h1Match[1].trim() : 'Web Source Document';
  }
  // Clean title entities
  title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

  // Look for publication date in meta tags
  let publishedDate: string | null = null;
  const metaDateMatch = html.match(
    /<meta[^>]*(?:property|name)=["'](?:article:published_time|pubdate|date|dc\.date|uploadDate)["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:article:published_time|pubdate|date|dc\.date|uploadDate)["']/i
  );

  if (metaDateMatch && metaDateMatch[1]) {
    publishedDate = metaDateMatch[1].trim();
  } else {
    // Look for text pattern like "Published: January 15, 2025" or "Date: 2024-11-10"
    const textDateMatch = html.match(/(?:published|posted|last updated|date)[:\s]+([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (textDateMatch && textDateMatch[1]) {
      publishedDate = textDateMatch[1].trim();
    }
  }

  // Look for academic/fiscal cycles like "2024–25", "2025-2026", "2026-27"
  let cycleInfo: string | null = null;
  const cycleMatch = html.match(/\b(202[0-9][–\/-](?:20)?2[0-9])\b/);
  if (cycleMatch) {
    cycleInfo = cycleMatch[1];
  }

  // Strip script, style, noscript, svg, nav, footer tags
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');

  // Convert break/paragraph tags to newlines
  cleaned = cleaned.replace(/<(?:br|p|div|li|tr|h1|h2|h3|h4|h5|h6)[^>]*>/gi, '\n');

  // Strip all other HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Normalize whitespace
  const lines = cleaned
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const text = lines.join('\n');

  return {
    title: title || sourceUrl,
    text,
    publishedDate,
    cycleInfo,
  };
}

// Fetch a single public URL with safety checks and timeout
export async function fetchPublicUrl(url: string): Promise<SourceItem> {
  const safeCheck = isSafePublicUrl(url);
  if (!safeCheck.safe) {
    return {
      id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: url,
      url,
      content: '',
      type: 'url',
      extractedAt: new Date().toISOString(),
      wordCount: 0,
      status: 'failed',
      errorMessage: safeCheck.reason,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DigitalDarkSpotBot/1.0 (Hackathon Research Verification; Shinchan Online Hackathon 2026)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: url,
        url,
        content: '',
        type: 'url',
        extractedAt: new Date().toISOString(),
        wordCount: 0,
        status: 'failed',
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text') && !contentType.includes('json') && !contentType.includes('xml')) {
      return {
        id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: url,
        url,
        content: '',
        type: 'url',
        extractedAt: new Date().toISOString(),
        wordCount: 0,
        status: 'failed',
        errorMessage: `Unsupported content-type: ${contentType}. Expected HTML or text document.`,
      };
    }

    const html = await response.text();
    const parsed = extractContentFromHtml(html, url);

    const words = parsed.text.trim().split(/\s+/).filter(Boolean).length;
    if (words < 15) {
      return {
        id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: parsed.title,
        url,
        content: parsed.text,
        type: 'url',
        extractedAt: new Date().toISOString(),
        wordCount: words,
        status: 'warning',
        errorMessage: 'Source page returned very little text content (less than 15 words). Might require JavaScript or login.',
      };
    }

    return {
      id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: parsed.title,
      url,
      content: parsed.text.slice(0, 50000), // Protect memory with 50k char cap
      type: 'url',
      publishedDate: parsed.publishedDate,
      cycleInfo: parsed.cycleInfo,
      extractedAt: new Date().toISOString(),
      wordCount: words,
      status: 'valid',
    };
  } catch (err: any) {
    let errorMsg = err?.message || 'Failed to fetch source page.';
    if (err?.name === 'AbortError') {
      errorMsg = 'Request timed out after 9 seconds. The server did not respond.';
    }
    return {
      id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: url,
      url,
      content: '',
      type: 'url',
      extractedAt: new Date().toISOString(),
      wordCount: 0,
      status: 'failed',
      errorMessage: errorMsg,
    };
  }
}

// Parse manually provided text or file content
export function createSourceFromText(
  title: string,
  content: string,
  type: 'text' | 'file' = 'text',
  customCycle?: string,
  customDate?: string
): SourceItem {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  
  // Extract cycle if not provided
  let cycleInfo = customCycle || null;
  if (!cycleInfo) {
    const cycleMatch = content.match(/\b(202[0-9][–\/-](?:20)?2[0-9])\b/);
    if (cycleMatch) cycleInfo = cycleMatch[1];
  }

  // Extract date if not provided
  let publishedDate = customDate || null;
  if (!publishedDate) {
    const dateMatch = content.match(/(?:published|updated|date|deadline)[:\s]+([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) publishedDate = dateMatch[1];
  }

  return {
    id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim() || 'Custom Document Source',
    content: content.trim(),
    type,
    publishedDate,
    cycleInfo,
    extractedAt: new Date().toISOString(),
    wordCount: words,
    status: words > 5 ? 'valid' : 'warning',
    errorMessage: words <= 5 ? 'Content appears too brief to analyze meaningful information.' : undefined,
  };
}
