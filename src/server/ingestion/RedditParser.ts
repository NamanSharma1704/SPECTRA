/**
 * RedditParser — scans r/thedivision using Reddit's RSS feeds.
 *
 * Reddit's RSS feeds are public, require zero auth, and bypass API restrictions.
 * Monitor r/thedivision and r/Division2Builds via RSS feeds.
 * Parse titles, post content, links, and timestamps.
 * Store posts in the staging queue for NLP build extraction.
 * No Reddit authentication, OAuth, or API keys are required.
 */

import { extractBuild, type ExtractedBuild } from "./BuildExtractor";

const SUBREDDITS = ["thedivision", "Division2Builds"];

export interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  author: string;
  created_utc: number;
}

export interface RedditScanResult {
  subreddit: string;
  postsScanned: number;
  buildsExtracted: ExtractedBuild[];
  errors: string[];
}

const clientId = process.env.REDDIT_CLIENT_ID;
const clientSecret = process.env.REDDIT_CLIENT_SECRET;
const username = process.env.REDDIT_USERNAME;
const password = process.env.REDDIT_PASSWORD;

function hasValidRedditCredentials() {
  return !!(clientId && clientSecret && username && password && 
         !clientId.includes("PASTE_") && !clientSecret.includes("PASTE_") &&
         !username.includes("PASTE_") && !password.includes("PASTE_"));
}

let redditAccessToken: string | null = null;
let redditTokenExpiry: number = 0;

async function getRedditAccessToken(): Promise<string> {
  if (redditAccessToken && Date.now() < redditTokenExpiry) {
    return redditAccessToken;
  }
  
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DIP-Scanner/1.0 (Division Intelligence Platform build scanner)'
    },
    body: `grant_type=password&username=${encodeURIComponent(username!)}&password=${encodeURIComponent(password!)}`
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit OAuth failed: ${res.status} ${text}`);
  }
  
  const data = await res.json();
  if (data.error) throw new Error(`Reddit OAuth error: ${data.error}`);
  
  redditAccessToken = data.access_token;
  redditTokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return redditAccessToken!;
}

// ── Fetch posts via RSS (Fallback) ───────────────────────────────────
async function fetchSubredditPostsRss(
  subreddit: string,
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.rss`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DIP-Scanner/1.0 (Division Intelligence Platform build scanner)",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error(`Rate limited (429) by Reddit for r/${subreddit}. Please wait a moment.`);
      }
      throw new Error(`Reddit RSS fetch failed: ${res.status} for r/${subreddit}`);
    }

    const xml = await res.text();
    
    // Very basic XML parsing for RSS
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const posts: RedditPost[] = [];
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entryText = match[1];
      
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(entryText);
      const contentMatch = /<content[^>]*>([\s\S]*?)<\/content>/.exec(entryText);
      const linkMatch = /<link href="([^"]+)"/.exec(entryText);
      const authorMatch = /<author>\s*<name>([^<]+)<\/name>/.exec(entryText);
      const updatedMatch = /<updated>([\s\S]*?)<\/updated>/.exec(entryText);

      // Unescape basic XML entities
      const unescapeXml = (str: string) => {
        return str
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/<!--[\s\S]*?-->/g, ''); // remove html comments
      };

      // Extract raw text from the content HTML
      let rawContent = "";
      if (contentMatch && contentMatch[1]) {
        rawContent = unescapeXml(contentMatch[1])
          .replace(/<[^>]+>/g, ' ') // Strip HTML tags
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim();
      }

      posts.push({
        title: titleMatch ? unescapeXml(titleMatch[1]) : "",
        selftext: rawContent,
        url: linkMatch ? linkMatch[1] : "",
        author: authorMatch ? authorMatch[1].replace('/u/', '') : "Unknown",
        created_utc: updatedMatch ? new Date(updatedMatch[1]).getTime() : Date.now(),
      });
    }

    return posts;
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── Fetch posts via OAuth with RSS Fallback ──────────────────────────
async function fetchSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  if (hasValidRedditCredentials()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const token = await getRedditAccessToken();
      const url = `https://oauth.reddit.com/r/${subreddit}/new?limit=25`;
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "User-Agent": "DIP-Scanner/1.0 (Division Intelligence Platform build scanner)"
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`Reddit OAuth API fetch failed: ${res.status}`);
      }
      
      const json = await res.json();
      return json.data.children.map((child: any) => ({
        title: child.data.title || "",
        selftext: child.data.selftext || "",
        url: child.data.url || `https://reddit.com${child.data.permalink}`,
        author: child.data.author || "Unknown",
        created_utc: child.data.created_utc ? child.data.created_utc * 1000 : Date.now()
      }));
    } catch(err: any) {
      clearTimeout(timeout);
      console.warn(`Reddit OAuth failed for r/${subreddit}, falling back to RSS... (${err.message})`);
      return fetchSubredditPostsRss(subreddit);
    }
  } else {
    return fetchSubredditPostsRss(subreddit);
  }
}

// ── Scan a single subreddit ────────────────────────────────────────────────
export async function scanSubreddit(subreddit: string): Promise<RedditScanResult> {
  const errors: string[] = [];
  const buildsExtracted: ExtractedBuild[] = [];
  let postsScanned = 0;

  try {
    const posts = await fetchSubredditPosts(subreddit);
    postsScanned += posts.length;

    for (const post of posts) {
      const extracted = extractBuild(
        post.title,
        post.selftext,
        "reddit",
        post.url,
        post.author,
        post.created_utc
      );
      if (extracted) buildsExtracted.push(extracted);
    }
  } catch (err: any) {
    if (err.message && err.message.includes("429")) {
      console.warn(`[WARN] r/${subreddit} RSS Rate Limited. Skipping for now.`);
    } else {
      errors.push(`r/${subreddit} RSS: ${err.message}`);
    }
  }

  // Deduplicate by inferred name
  const unique = buildsExtracted.filter(
    (b, i, arr) => arr.findIndex((x) => x.inferredName === b.inferredName) === i
  );

  return { subreddit, postsScanned, buildsExtracted: unique, errors };
}

// ── Scan all configured subreddits ─────────────────────────────────────────
export async function scanAllSubreddits(): Promise<RedditScanResult[]> {
  const results: RedditScanResult[] = [];
  for (const sub of SUBREDDITS) {
    results.push(await scanSubreddit(sub));
  }
  return results;
}
