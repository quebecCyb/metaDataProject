"use client";
import React, { useState } from "react";

export default function IpMetaPage() {
  const [ip, setIp] = useState("");
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMeta(null);
    try {
      const res = await fetch("/api/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip })
      });
      if (!res.ok) throw new Error("Ошибка запроса: " + res.status);
      const data = await res.json();
      setMeta(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <div className="w-full flex justify-start mb-2">
        <a href="/" aria-label="Back to home" className="inline-flex items-center justify-center rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition p-2">
          <img src="/reply.png" alt="Back to home" width={32} height={32} />
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-4">IP Metadata Analysis</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          required
          placeholder="Введите IP-адрес"
          value={ip}
          onChange={e => setIp(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 18px" }}>
          {loading ? "Loading..." : "Get Metadata"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error.replace('Ошибка', 'Error')}</div>}
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
              a.download = "ipmeta-report.json";
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
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(meta, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
