import { db } from "../db";
import type { Database } from "@/types/database.types";

export type Build = Database["public"]["Tables"]["builds"]["Row"];
export type BuildVersion = Database["public"]["Tables"]["build_versions"]["Row"];

export class BuildRepository {
  static async getAllBuilds() {
    // Perform a join to fetch builds with their creator and author
    const { data, error } = await db
      .from("builds")
      .select(`
        *,
        creators (id, name, youtube_url),
        users (username),
        build_sources (*),
        build_activity_scores (
          meta_score,
          threat_level,
          confidence_score,
          activities (name)
        )
      `);

    if (error) throw new Error(`Failed to fetch builds: ${error.message}`);
    return data;
  }

  static async getBuildById(id: string) {
    const { data, error } = await db
      .from("builds")
      .select(`
        *,
        creators (id, name, youtube_url, is_verified),
        users (username),
        build_sources (*),
        build_activity_scores (
          meta_score,
          threat_level,
          confidence_score,
          success_rate,
          popularity_index,
          activities (id, name, type, difficulty)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(`Failed to fetch build: ${error.message}`);
    return data;
  }

  static async getBuildVersions(buildId: string) {
    const { data, error } = await db
      .from("build_versions")
      .select(`
        *,
        patches (version, name)
      `)
      .eq("build_id", buildId);

    if (error) throw new Error(`Failed to fetch build versions: ${error.message}`);
    return data;
  }
}
