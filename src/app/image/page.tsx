"use client";
import React, { useState } from "react";

import Image from "next/image";

export default function ImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMeta(null);
      setError(null);
      try {
        // @ts-ignore
        const exifr = (await import('exifr')).default;
        const arrayBuffer = await selectedFile.arrayBuffer();
        const metadata = await exifr.parse(arrayBuffer);
        setMeta(metadata || { info: 'Нет EXIF метаданных' });
      } catch (err: any) {
        setError('Ошибка чтения метаданных: ' + err.message);
      }
    }
  };


  // Пока без чтения метаданных, только форма
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h1 className="text-2xl font-bold mb-4">Extract EXIF Metadata from Image</h1>
      <form>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </form>
      {file && (
        <div style={{ marginTop: 24 }}>
          <b>Selected file:</b> {file.name}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {meta && (
        <>
          <h2 className="text-lg font-semibold mt-4 mb-2">Result:</h2>
          <button
            type="button"
            aria-label="Download JSON report"
            className="mt-4 mb-2 px-5 py-2 rounded-lg border border-white bg-transparent text-white font-semibold shadow transition-colors cursor-pointer hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
            style={{ outline: 'none' }}
            onClick={() => {
              const blob = new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "image-meta-report.json";
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            }}
          >
            Download JSON report
          </button>
          <div className="w-full flex justify-start mb-2">
            <a href="/" aria-label="Back to home" className="inline-flex items-center justify-center rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition p-2">
              <Image src="/reply.png" alt="Back to home" width={32} height={32} />
            </a>
          </div>
          <div className="w-full mt-4">
            <pre className="whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-900 rounded p-4 text-sm max-w-2xl mx-auto">
              {JSON.stringify(meta, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
