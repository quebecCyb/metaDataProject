import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ip } = await req.json();
    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "IP не указан" }, { status: 400 });
    }
    // Основные метаданные по IP
    let geo = null;
    let whois = null;
    let reverse = null;
    let asn = null;
    // GeoIP (используем ip-api.com)
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,reverse,query`);
      geo = await geoRes.json();
    } catch (e) {
      geo = { error: (e as any).message };
    }
    // WHOIS (через whois-json)
    try {
      const whoisModule = await import('whois-json');
      whois = await whoisModule.default(ip);
    } catch (e) {
      whois = { error: (e as any).message };
    }
    // Reverse DNS
    try {
      const { reverse } = await import('dns').then(m => m.promises);
      reverse = await reverse(ip);
    } catch (e) {
      reverse = { error: (e as any).message };
    }
    // ASN (через iptoasn.com)
    try {
      const asnRes = await fetch(`https://api.iptoasn.com/v1/as/ip/${ip}`);
      asn = await asnRes.json();
    } catch (e) {
      asn = { error: (e as any).message };
    }
    return NextResponse.json({
      ip,
      geo,
      whois,
      reverse,
      asn
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
