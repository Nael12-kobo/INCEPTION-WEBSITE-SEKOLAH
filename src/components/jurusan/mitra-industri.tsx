import Image from "next/image";

type JurusanAccent = "red" | "gray" | "orange" | "blue";

const mitra = [
  { nama: "Sinarmas", gambar: "/sponsor/sinarmas.png", w: 1280, h: 287 },
  { nama: "iForte", gambar: "/sponsor/iforte.png", w: 1510, h: 516 },
  { nama: "Wings", gambar: "/sponsor/wings.svg", w: 1499, h: 881 },
  { nama: "Garudafood", gambar: "/sponsor/garudafood.png", w: 207, h: 50 },
  { nama: "Indofood", gambar: "/sponsor/indofood.svg", w: 265, h: 87 },
  { nama: "Bakti Barito", gambar: "/sponsor/bakti-barito.png", w: 634, h: 247 },
  {
    nama: "Triputra Agro Persada",
    gambar: "/sponsor/triputra-agro.png",
    w: 5116,
    h: 1777,
  },
  {
    nama: "Agung Sedayu Group",
    gambar: "/sponsor/agung-sedayu.png",
    w: 232,
    h: 160,
  },
  {
    nama: "PT Ciliandra Perkasa",
    gambar: "/sponsor/ciliandra-perkasa.png",
    w: 282,
    h: 500,
  },
];

const accentClasses: Record<
  JurusanAccent,
  { section: string; cardHover: string }
> = {
  red: {
    section: "bg-red-50/60 dark:bg-gray-950",
    cardHover: "hover:border-red-400",
  },
  gray: {
    section: "bg-gray-50 dark:bg-gray-950",
    cardHover: "hover:border-gray-500",
  },
  orange: {
    section: "bg-orange-50/60 dark:bg-gray-950",
    cardHover: "hover:border-orange-400",
  },
  blue: {
    section: "bg-blue-50/60 dark:bg-gray-950",
    cardHover: "hover:border-blue-400",
  },
};

function PartnerCard({
  partner,
  cardHover,
}: {
  partner: (typeof mitra)[number];
  cardHover: string;
}) {
  return (
    <div
      className={`flex h-24 w-48 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cardHover}`}
      title={partner.nama}
    >
      <Image
        src={partner.gambar}
        alt={`Logo ${partner.nama}`}
        width={partner.w}
        height={partner.h}
        loading="lazy"
        className="max-h-14 max-w-[80%] object-contain transition-all duration-300"
      />
    </div>
  );
}

export default function MitraIndustri({ accent }: { accent: JurusanAccent }) {
  const colors = accentClasses[accent];

  return (
    <section
      id="mitra"
      aria-labelledby="mitra-heading"
      className={`border-b py-16 md:py-20 dark:border-gray-800 ${colors.section}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2
            id="mitra-heading"
            className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl"
          >
            Mitra Industri
          </h2>
          <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
            Kolaborasi dengan dunia usaha dan industri membantu siswa
            mendapatkan pengalaman praktik kerja serta mengembangkan
            kompetensi yang relevan.
          </p>
        </div>

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max gap-6">
            <div className="flex shrink-0 items-center gap-6 animate-marquee">
              {mitra.map((partner) => (
                <PartnerCard
                  key={partner.nama}
                  partner={partner}
                  cardHover={colors.cardHover}
                />
              ))}
            </div>

            <div
              className="flex shrink-0 items-center gap-6 animate-marquee"
              aria-hidden="true"
            >
              {mitra.map((partner) => (
                <PartnerCard
                  key={`duplicate-${partner.nama}`}
                  partner={partner}
                  cardHover={colors.cardHover}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
