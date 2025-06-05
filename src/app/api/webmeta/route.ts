import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL не указан" }, { status: 400 });
    }
    const ttfbStart = Date.now();
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const ttfb = Date.now() - ttfbStart;
    const html = await res.text();
    const $ = cheerio.load(html);
    // Собираем все headers в объект
    const headersObj: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    // Определяем IP-адрес сайта
    let ip = null;
    try {
      const { hostname } = new URL(url);
      const { lookup } = await import('dns').then(m => m.promises);
      ip = (await lookup(hostname)).address;
    } catch (e) {
      ip = { error: (e as any).message };
    }
    // Получаем SSL-сертификат для https
    let ssl = null;
    try {
      const { hostname, protocol } = new URL(url);
      if (protocol === 'https:') {
        const tls = await import('tls');
        ssl = await new Promise((resolve, reject) => {
          const socket = tls.connect({
            host: hostname,
            port: 443,
            servername: hostname,
            rejectUnauthorized: false,
            timeout: 4000
          }, () => {
            const cert = socket.getPeerCertificate();
            resolve({
              valid_from: cert.valid_from,
              valid_to: cert.valid_to,
              subject: cert.subject,
              issuer: cert.issuer,
              fingerprint: cert.fingerprint,
              serialNumber: cert.serialNumber,
              altNames: cert.subjectaltname,
              infoAccess: cert.infoAccess
            });
            socket.end();
          });
          socket.on('error', err => reject(err));
          socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('SSL timeout'));
          });
        });
      }
    } catch (e) {
      ssl = { error: (e as any).message };
    }
    // Определяем домен для whois
    let whoisData = null;
    try {
      const { hostname } = new URL(url);
      const whois = await import('whois-json');
      whoisData = await whois.default(hostname);
    } catch (e) {
      whoisData = { error: (e as any).message };
    }
    // JSON-LD: все <script type="application/ld+json">
    const jsonld: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const txt = $(el).html();
        if (txt) {
          const parsed = JSON.parse(txt);
          jsonld.push(parsed);
        }
      } catch (e) {
        jsonld.push({ error: 'Invalid JSON-LD', raw: $(el).html() });
      }
    });
    // Microdata: все элементы с itemscope/itemtype/itemprop
    const microdata: any[] = [];
    $('[itemscope]').each((_, el) => {
      const $el = $(el);
      microdata.push({
        tag: $el.get(0)?.tagName,
        itemtype: $el.attr('itemtype') || null,
        itemprop: $el.attr('itemprop') || null,
        props: $el.find('[itemprop]').map((i, propEl) => ({
          tag: $(propEl).get(0)?.tagName,
          itemprop: $(propEl).attr('itemprop'),
          content: $(propEl).attr('content') || $(propEl).text()
        })).get()
      });
    });
    // Собираем все <meta ...> теги, кроме явно вынесенных
    const excludedMetaNames = new Set([
      'description', 'keywords', 'robots', 'position',
      'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
      'og:title', 'og:description', 'og:image', 'og:type', 'og:url'
    ]);
    const metaTags = $("meta").toArray().map(el => {
      const attribs = el.attribs || {};
      const nameOrProp = attribs.name || attribs.property || attribs["http-equiv"];
      if (nameOrProp && excludedMetaNames.has(nameOrProp.toLowerCase())) return null;
      return attribs;
    }).filter(Boolean);
    // Список всех картинок
    const images = $("img").toArray().map(el => ({
      src: el.attribs?.src || null,
      alt: el.attribs?.alt || null
    }));
    // Список всех ссылок
    const links = $("a").toArray().map(el => ({
      href: el.attribs?.href || null,
      text: $(el).text() || null
    }));
    const meta = {
      url,
      status: res.status,
      contentType: res.headers.get("content-type"),
      headers: headersObj,
      ip,
      ttfb,
      ssl,
      whois: whoisData,
      jsonld,
      microdata,
      metaTags,
      images,
      links,
      title: $("title").text() || null,
      description: $('meta[name="description"]').attr("content") || null,
      keywords: $('meta[name="keywords"]').attr("content") || null,
      og: {
        title: $('meta[property="og:title"]').attr("content") || null,
        description: $('meta[property="og:description"]').attr("content") || null,
        image: $('meta[property="og:image"]').attr("content") || null,
        type: $('meta[property="og:type"]').attr("content") || null,
        url: $('meta[property="og:url"]').attr("content") || null,
      },
      twitter: {
        card: $('meta[name="twitter:card"]').attr("content") || null,
        title: $('meta[name="twitter:title"]').attr("content") || null,
        description: $('meta[name="twitter:description"]').attr("content") || null,
        image: $('meta[name="twitter:image"]').attr("content") || null,
      },
      favicon: $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || null,
      canonical: $('link[rel="canonical"]').attr("href") || null,
      robots: $('meta[name="robots"]').attr("content") || null,
      h1: $("h1").map((i, el) => $(el).text()).get(),
      h2: $("h2").map((i, el) => $(el).text()).get(),
      size: html.length
    };
    return NextResponse.json(meta);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
