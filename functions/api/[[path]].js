export async function onRequest() {
  return new Response(JSON.stringify({ preview: true, error: 'Not available on the preview site.' }), {
    status: 503,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' }
  });
}
