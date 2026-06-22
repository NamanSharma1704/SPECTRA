import { db } from "@/server/db";
import { ForecastDashboard } from "@/components/forecast/ForecastDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DIP | Meta Forecasts",
  description: "Predictive intelligence for Division 2 meta shifts. Track emerging, established, and dominant gearsets, skills, and exotics.",
};

export default async function ForecastPage() {
  const { data: forecasts } = await db
    .from("meta_forecasts")
    .select("*")
    .order("confidence_score", { ascending: false });

  return <ForecastDashboard initialForecasts={forecasts ?? []} />;
}
