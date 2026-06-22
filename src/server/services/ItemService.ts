import { ItemRepository } from "../repositories/ItemRepository";

export class ItemService {
  /**
   * Fetches all core item categories and returns a unified taxonomy map
   */
  static async getUnifiedItemTaxonomy() {
    const [weapons, brands, gearSets, exotics] = await Promise.all([
      ItemRepository.getAllBaseWeapons(),
      ItemRepository.getAllBrandSets(),
      ItemRepository.getAllGearSets(),
      ItemRepository.getAllExotics()
    ]);

    return {
      weapons,
      brands,
      gearSets,
      exotics,
      _metadata: {
        totalItems: weapons.length + brands.length + gearSets.length + exotics.length,
        syncedAt: new Date().toISOString()
      }
    };
  }
}
