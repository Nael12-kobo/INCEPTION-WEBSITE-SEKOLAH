export interface ExplorePanorama {
  slug: string;
  label: string;
  src: string;
  file: string;
  alt: string;
}

export interface ExploreLocation {
  slug: string;
  label: string;
  /** Percentage coordinates relative to the full map image. */
  x: number;
  y: number;
  panoramas: ExplorePanorama[];
}

export const EXPLORE_MAP_SRC = "/images/explore/map-sekolah.jpg";
export const EXPLORE_MAP_FILE = "images/explore/map-sekolah.jpg";

const panorama = (
  slug: string,
  label: string,
  alt: string,
  filename: string,
): ExplorePanorama => ({
  slug,
  label,
  src: `/images/explore/photospheres/${filename}`,
  file: `images/explore/photospheres/${filename}`,
  alt,
});

/**
 * Sesuaikan x/y setelah map sekolah tersedia. Nilai menggunakan persentase
 * terhadap lebar/tinggi gambar agar marker tetap pada titik yang sama saat
 * map menyesuaikan ukuran layar.
 */
export const EXPLORE_LOCATIONS: ExploreLocation[] = [
  {
    slug: "tefa-2",
    label: "Tefa 2",
    x: 50.5,
    y: 55,
    panoramas: [
      panorama(
        "tefa-2-1",
        "Lantai 1",
        "Photosphere Tefa 2, lantai 1",
        "Tefa2Lantai1.jpeg",
      ),
      panorama(
        "tefa-2-2",
        "Lantai 2",
        "Photosphere Tefa 2, lantai 2",
        "Tefa2Lantai2.jpeg",
      ),
    ],
  },
  {
    slug: "asrama-putra",
    label: "Asrama Putra",
    x: 50,
    y: 49,
    panoramas: [
      panorama(
        "asrama-putra-1",
        "Asrama Putra",
        "Photosphere Asrama Putra",
        "AsramaPutra.jpeg",
      ),
      panorama(
        "asrama-putra-2",
        "Ruang Makan",
        "Photosphere ruang makan Asrama Putra",
        "RuangMakanAsrama.jpeg",
      ),
    ],
  },
  {
    slug: "lapangan-basket",
    label: "Lapangan Basket",
    x: 57,
    y: 43,
    panoramas: [
      panorama(
        "lapangan-basket",
        "Lapangan Basket",
        "Photosphere Lapangan Basket",
        "LapanganBasket.jpeg",
      ),
    ],
  },
  {
    slug: "lapangan-rumput",
    label: "Lapangan Rumput",
    x: 50,
    y: 43,
    panoramas: [
      panorama(
        "lapangan-rumput",
        "Lapangan Rumput",
        "Photosphere Lapangan Rumput",
        "LapanganRumput.jpeg",
      ),
    ],
  },
  {
    slug: "dak",
    label: "DAK",
    x: 55.5,
    y: 52,
    panoramas: [
      panorama(
        "dak",
        "DAK",
        "Photosphere DAK",
        "Dak.jpeg"
      )
    ],
  },
  {
    slug: "lobby",
    label: "Lobby",
    x: 59,
    y: 39,
    panoramas: [panorama("lobby", "Lobby", "Photosphere Lobby", "Lobby.jpeg")],
  },
  {
    slug: "masjid",
    label: "Masjid",
    x: 41,
    y: 40,
    panoramas: [
      panorama("masjid", "Masjid", "Photosphere Masjid", "Masjid.jpg.jpeg"),
    ],
  },
  {
    slug: "bengkel-otomotif",
    label: "Bengkel Otomotif",
    x: 47,
    y: 60,
    panoramas: [
      panorama(
        "bengkel-otomotif",
        "Bengkel Otomotif",
        "Photosphere Bengkel Otomotif",
        "BengkelOtomotif.jpg.jpeg",
      ),
    ],
  },
];
