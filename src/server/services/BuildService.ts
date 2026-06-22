import { BuildRepository } from "../repositories/BuildRepository";

export class BuildService {
  /**
   * Fetches all core builds and hydrates them with creator metadata
   */
  static async getHydratedBuilds() {
    const builds = await BuildRepository.getAllBuilds();
    
    // In a real application, you might selectively hydrate versions here
    // For now we'll just return the base builds
    return {
      data: builds,
      _metadata: {
        totalCount: builds.length,
        syncedAt: new Date().toISOString()
      }
    };
  }
}
