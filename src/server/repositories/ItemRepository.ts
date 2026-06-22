import { db } from "../db";
import type { Database } from "@/types/database.types";

export type BaseWeapon = Database["public"]["Tables"]["base_weapons"]["Row"];
export type BrandSet = Database["public"]["Tables"]["brand_sets"]["Row"];
export type GearSet = Database["public"]["Tables"]["gear_sets"]["Row"];
export type Exotic = Database["public"]["Tables"]["exotics"]["Row"];

export class ItemRepository {
  static async getAllBaseWeapons(): Promise<BaseWeapon[]> {
    const { data, error } = await db.from("base_weapons").select("*");
    if (error) throw new Error(`Failed to fetch weapons: ${error.message}`);
    return data;
  }

  static async getAllBrandSets(): Promise<BrandSet[]> {
    const { data, error } = await db.from("brand_sets").select("*");
    if (error) throw new Error(`Failed to fetch brand sets: ${error.message}`);
    return data;
  }

  static async getAllGearSets(): Promise<GearSet[]> {
    const { data, error } = await db.from("gear_sets").select("*");
    if (error) throw new Error(`Failed to fetch gear sets: ${error.message}`);
    return data;
  }

  static async getAllExotics(): Promise<Exotic[]> {
    const { data, error } = await db.from("exotics").select("*");
    if (error) throw new Error(`Failed to fetch exotics: ${error.message}`);
    return data;
  }
}
