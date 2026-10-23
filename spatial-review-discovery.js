// Preserve the GitHub Pages project directory in both discovery and capture URLs.
export function pondDiscoveryForPage(pageUrl) {
  const websiteUrl = new URL('./', pageUrl).href;
  return {
    name: 'Koi Pond Garden',
    websiteUrl,
    discoveryUrl: new URL('.well-known/spatial-review.json', websiteUrl).href,
    liveCapture: new URL('koi-pond.html?spatial-review-capture=1', websiteUrl).href,
  };
}
