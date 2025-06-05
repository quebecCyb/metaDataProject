import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex justify-center w-full mb-2">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-center mt-2 mb-2">Metadata Scraper</h1>
          <p className="text-lg text-center max-w-2xl text-gray-700 dark:text-gray-200 mb-6">
            A tool for analyzing and exporting metadata from files, images, and web pages. Instantly extract EXIF, PDF, audio/video, web meta, HTTP headers, whois, SSL and much more — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a
              href="/image"
              className="flex-1 min-w-[180px] rounded-xl border border-solid border-black/[.08] dark:border-white/[.145] bg-white dark:bg-[#23272f] shadow hover:shadow-lg transition p-6 flex flex-col items-center gap-2 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
            >
              <Image src="/picture.png" alt="Image" width={32} height={32} />
              <span className="font-semibold text-base">Images</span>
              <span className="text-xs text-gray-500 text-center">EXIF, format, size, date, camera, and more</span>
            </a>
            <a
              href="/file"
              className="flex-1 min-w-[180px] rounded-xl border border-solid border-black/[.08] dark:border-white/[.145] bg-white dark:bg-[#23272f] shadow hover:shadow-lg transition p-6 flex flex-col items-center gap-2 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
            >
              <Image src="/google-docs.png" alt="File" width={32} height={32} />
              <span className="font-semibold text-base">Files</span>
              <span className="text-xs text-gray-500 text-center">PDF, audio, video, office docs, and more</span>
            </a>
            <a
              href="/web"
              className="flex-1 min-w-[180px] rounded-xl border border-solid border-black/[.08] dark:border-white/[.145] bg-white dark:bg-[#23272f] shadow hover:shadow-lg transition p-6 flex flex-col items-center gap-2 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
            >
              <Image src="/web-link.png" alt="Web" width={32} height={32} />
              <span className="font-semibold text-base">Web Pages</span>
              <span className="text-xs text-gray-500 text-center">Meta, OpenGraph, headers, SSL, whois, and more</span>
            </a>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
