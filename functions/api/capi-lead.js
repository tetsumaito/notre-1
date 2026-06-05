// Meta Conversions API (CAPI) - Lead サーバー送信
// Cloudflare Pages Function。POST /api/capi-lead で呼ばれる。
// 楽天記事LP(rakuten-ec-article) のサンクスページから、ブラウザPixelと同じ eventId を渡して
// Meta側で重複排除(dedup)させる。email/phone/name は SHA-256 ハッシュして Advanced Matching に使う。
//
// 環境変数 (Cloudflare Pages → Settings → Environment variables):
//   META_CAPI_ACCESS_TOKEN    ... 必須。Events Manager で発行した Lead 用トークン
//   META_CAPI_PIXEL_ID        ... 必須。楽天EC_LP_Pixel = 1250132826712883
//   META_CAPI_TEST_EVENT_CODE ... 任意。Test Events 確認時のみ設定し、確認後に削除する
//                                 （リクエスト body の testEventCode でも指定可。body 指定が優先）
//
// 未設定時は何も送らず {skipped:true} を返す（＝LP側に害を出さない）。

const GRAPH_VERSION = 'v21.0';

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Meta 正規化ルールに沿ってハッシュ（空なら undefined を返して送らない）
async function hashEmail(v) {
  if (!v) return undefined;
  return sha256Hex(String(v).trim().toLowerCase());
}
async function hashPhone(v) {
  if (!v) return undefined;
  let d = String(v).replace(/[^0-9]/g, '');
  if (!d) return undefined;
  // 日本の番号を国番号付き(81...)へ正規化: 先頭0を81に置換
  if (d.startsWith('0')) d = '81' + d.slice(1);
  else if (!d.startsWith('81')) d = '81' + d;
  return sha256Hex(d);
}
async function hashName(v) {
  if (!v) return undefined;
  return sha256Hex(String(v).trim().toLowerCase());
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 環境変数未設定なら no-op（トークン投入前でもLPを壊さない）
  if (!env.META_CAPI_ACCESS_TOKEN || !env.META_CAPI_PIXEL_ID) {
    return Response.json({ skipped: true, reason: 'CAPI env not configured' }, { status: 200 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  try {
    const {
      eventId, email, phone, name, fbc, fbp, eventSourceUrl, value, currency,
      contentName, contentCategory, testEventCode,
    } = body;

    // 氏名を 姓/名 に分割（空白区切り。区切りが無ければ全体を姓に）
    let ln = '', fn = '';
    if (name) {
      const parts = String(name).trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) { ln = parts[0]; fn = parts.slice(1).join(''); }
      else if (parts.length === 1) { ln = parts[0]; }
    }

    const userData = {
      em: await hashEmail(email),
      ph: await hashPhone(phone),
      ln: await hashName(ln),
      fn: await hashName(fn),
      // クリックID/ブラウザID（生のまま送る。ハッシュ不要）
      fbc: fbc || undefined,
      fbp: fbp || undefined,
      client_ip_address: request.headers.get('CF-Connecting-IP') || undefined,
      client_user_agent: request.headers.get('User-Agent') || undefined,
    };
    // undefined を除去
    Object.keys(userData).forEach((k) => userData[k] === undefined && delete userData[k]);

    const event = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventSourceUrl || undefined,
      event_id: eventId || undefined, // ← ブラウザPixelと同じIDで dedup
      user_data: userData,
      custom_data: {
        content_name: contentName || '無料診断申込',
        content_category: contentCategory || 'rakuten-ec-article',
        value: typeof value === 'number' ? value : 5000,
        currency: currency || 'JPY',
      },
    };

    const payload = { data: [event] };
    // Test Events 確認用コード。リクエスト body 優先、無ければ env。
    // body 指定時は必ず Test Events に振り分くため、本番計測を汚さずに検証できる。
    const tec = (typeof testEventCode === 'string' && testEventCode) || env.META_CAPI_TEST_EVENT_CODE;
    if (tec) payload.test_event_code = tec;

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${env.META_CAPI_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_CAPI_ACCESS_TOKEN)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.log('[capi-lead] Meta API error', res.status, JSON.stringify(result));
      return Response.json({ ok: false, status: res.status, result }, { status: 200 });
    }
    return Response.json({ ok: true, result }, { status: 200 });
  } catch (e) {
    // fire-and-forget: 失敗してもユーザー体験は壊さない
    console.log('[capi-lead] error', e && e.message);
    return Response.json({ ok: false, error: String(e && e.message) }, { status: 200 });
  }
}
