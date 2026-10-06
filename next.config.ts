import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Foto berita diambil dari situs resmi sekolah (WordPress).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.tunasharapan.info",
        pathname: "/official/wp-content/uploads/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Model VRM — cache immutable agar kunjungan berikutnya instan
        // dari cache browser, tanpa mengubah file.
        //
        // Content-Type wajib model/gltf-binary: kalau dibiarkan
        // application/octet-stream, Chrome di HP menawarkan file ini
        // untuk DIUNDUH (bukan ditampilkan) saat URL-nya dibuka.
        source: "/models/:path*.vrm",
        headers: [
          {
            key: "Content-Type",
            value: "model/gltf-binary",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
