import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ExploreMapPage } from "@/components/ExploreMapPage";
import {
  EXPLORE_LOCATIONS,
  EXPLORE_MAP_FILE,
} from "@/lib/explore-map";

export const metadata: Metadata = {
  title: "Explore Sekolah | SMK Telekomunikasi Tunas Harapan",
  description:
    "Jelajahi lokasi fasilitas SMK Telekomunikasi Tunas Harapan melalui map dan photosphere 360°.",
};

export default function ExplorePage() {
  const mapAvailable = existsSync(
    join(process.cwd(), "public", EXPLORE_MAP_FILE),
  );
  const availableLocationSlugs = EXPLORE_LOCATIONS.filter((location) =>
    location.panoramas.length > 0 && location.panoramas.every((panorama) =>
      existsSync(join(process.cwd(), "public", panorama.file)),
    ),
  ).map((location) => location.slug);

  return (
    <ExploreMapPage
      mapAvailable={mapAvailable}
      availableLocationSlugs={availableLocationSlugs}
    />
  );
}
