import Image from "next/image";

export default function Home() {
  return (
    <section>
      <h1 className="text-4xl font-extrabold text-center">Cards</h1>
      <div className="flex flex-wrap justify-center gap-5 mt-5 *:max-w-md">
        <Image
          src="/api/stats"
          unoptimized
          alt={`${process.env.GITHUB_USERNAME}'s GitHub Stats`}
          width={440}
          height={210}
          className="w-full"
        />
        <Image
          src="/api/streak"
          unoptimized
          alt={`${process.env.GITHUB_USERNAME}'s GitHub Streak`}
          width={440}
          height={210}
          className="w-full"
        />
        <Image
          src="/api/top-lang"
          unoptimized
          alt={`${process.env.GITHUB_USERNAME}'s GitHub Top Languages`}
          width={300}
          height={160}
          className="w-full"
        />
      </div>
    </section>
  );
}
