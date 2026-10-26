import { existsSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ExplorePhotospherePage } from "@/components/ExplorePhotospherePage";
import { EXPLORE_LOCATIONS } from "@/lib/explore-map";

interface ExplorePhotosphereRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function ExplorePhotosphereRoute({
  params,
}: ExplorePhotosphereRouteProps) {
  const { slug } = await params;
  const location = EXPLORE_LOCATIONS.find((item) => item.slug === slug);
  if (!location) notFound();

  const allPhotospheresAvailable =
    location.panoramas.length > 0 &&
    location.panoramas.every((panorama) =>
      existsSync(join(process.cwd(), "public", panorama.file)),
    );
  if (!allPhotospheresAvailable) notFound();

  return <ExplorePhotospherePage location={location} />;
}
