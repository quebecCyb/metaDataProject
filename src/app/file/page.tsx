"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function FileMetaPage() {
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
        let metadata: any = null;
        const arrayBuffer = await selectedFile.arrayBuffer();
        if (selectedFile.type.startsWith("image/")) {
          // Изображения: exifr
          try {
            // @ts-ignore
            const exifr = (await import("exifr")).default;
            metadata = await exifr.parse(arrayBuffer);
            if (!metadata) metadata = { info: "Нет EXIF-метаданных" };
          } catch (e) {
            metadata = { error: "exifr: " + (e as any).message };
          }
        } else if (selectedFile.type === "application/pdf") {
          // PDF: pdfjs-dist/legacy/build/pdf (работает в браузере)
          try {
            if (typeof window === "undefined") {
              setError("PDF обработка доступна только в браузере");
              return;
            }
            // @ts-ignore
            const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";
            let pdf = null;
            let numPages = null;
            let pdfError = null;
            try {
              const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
              pdf = await loadingTask.promise;
              numPages = pdf.numPages;
            } catch (e) {
              pdfError = (e as any).message || String(e);
            }
            metadata = {
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              numPages: numPages,
              pdfError: pdfError
            };


          } catch (e) {
            metadata = { error: "pdfjs: " + (e as any).message };
          }
        } else if (selectedFile.type.startsWith("audio/") || selectedFile.type.startsWith("video/")) {
          // Аудио/видео: music-metadata-browser
          try {
            const mm = await import("music-metadata-browser");
            metadata = await mm.parseBlob(new Blob([arrayBuffer], { type: selectedFile.type }));
          } catch (e) {
            metadata = { error: "music-metadata: " + (e as any).message };
          }
        } else {
          // Базовая информация для других типов
          metadata = {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            lastModified: new Date(selectedFile.lastModified).toLocaleString(),
            info: "Метаданные не поддерживаются для этого типа файла."
          };
        }
        setMeta(metadata || { info: "Нет метаданных." });
      } catch (err: any) {
        setError("Ошибка чтения метаданных: " + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <div className="w-full flex justify-start mb-2">
        <a href="/" aria-label="На главную" className="inline-flex items-center justify-center rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition p-2">
          <Image src="/reply.png" alt="На главную" width={32} height={32} />
        </a>
      </div>
      <h2>Extract Metadata from File</h2>
      <form>
        <input type="file" onChange={handleFileChange} />
      </form>
      {file && (
        <div style={{ marginTop: 24 }}>
          <b>Выбран файл:</b> {file.name}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error.replace('Ошибка', 'Error')}</div>}
      {meta && (
        <>
          <button
            type="button"
            aria-label="Скачать JSON отчёт"
            className="mt-4 mb-2 px-5 py-2 rounded-lg border border-white bg-transparent text-white font-semibold shadow transition-colors cursor-pointer hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
            style={{ outline: 'none' }}
            onClick={() => {
              const blob = new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "file-meta-report.json";
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            }}
          >
            Скачать JSON отчёт
          </button>
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
