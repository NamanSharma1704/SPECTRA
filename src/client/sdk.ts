// Internal REST API SDK for Frontend Components

export class DIPClient {
  private static baseUrl = typeof window === 'undefined' ? 'http://localhost:3000/api/v1' : '/api/v1';

  /**
   * Fetches the complete unified item taxonomy (Weapons, Brands, Gear)
   */
  static async getItems() {
    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 } // Cache heavily
    });
    
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  }

  /**
   * Fetches all core builds hydrated with metadata
   */
  static async getBuilds() {
    const res = await fetch(`${this.baseUrl}/builds`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });

    if (!res.ok) throw new Error('Failed to fetch builds');
    return res.json();
  }

  /**
   * Fetches a single build by ID with full activity matrix and verdict
   */
  static async getBuild(id: string) {
    const res = await fetch(`${this.baseUrl}/builds/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 }
    });
    if (!res.ok) throw new Error(`Failed to fetch build: ${id}`);
    return res.json();
  }
  /**
   * Fetches all activities
   */
  static async getActivities() {
    const res = await fetch(`${this.baseUrl}/activities`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  }

  /**
   * Fetches top builds for a specific activity
   */
  static async getActivityBuilds(activityId: string) {
    const res = await fetch(`${this.baseUrl}/activities?activityId=${activityId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 }
    });
    if (!res.ok) throw new Error('Failed to fetch activity builds');
    return res.json();
  }

  /**
   * Fetches the full morning intelligence briefing
   */
  static async getIntel() {
    const res = await fetch(`${this.baseUrl.replace('/v1', '')}/meta`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) throw new Error('Failed to fetch intelligence briefing');
    return res.json();
  }

  /**
   * Fetches a structural DNA comparison between two builds
   */
  static async compareBuilds(aId: string, bId: string) {
    const res = await fetch(`${this.baseUrl}/compare?a=${aId}&b=${bId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 120 }
    });
    if (!res.ok) throw new Error('Failed to compare builds');
    return res.json();
  }

  /**
   * Fetches all creators enriched with build stats
   */
  static async getCreators() {
    const res = await fetch(`${this.baseUrl}/creators`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 } // Disabled cache so live updates show instantly
    });
    if (!res.ok) throw new Error('Failed to fetch creators');
    return res.json();
  }

  /**
   * Fetches full creator profile: builds, archetype breakdown, activity performance
   */
  static async getCreatorProfile(id: string) {
    const res = await fetch(`${this.baseUrl}/creators/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error(`Failed to fetch creator profile: ${id}`);
    return res.json();
  }
}
