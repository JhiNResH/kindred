import fetch from 'node-fetch';
global.fetch = fetch;

const GOOGLE_API_KEY = 'AIzaSyB_rRxlaWuBwEpjPEQDVKFpWqUv9mctNYA';

async function searchPlace(query) {
  console.log('[Test] Searching for:', query);
  
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'zh-TW',
          maxResultCount: 1
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('[Test] API error:', response.status, text);
      return null;
    }

    const data = await response.json();
    const place = data.places?.[0];
    
    if (!place) {
      console.log('[Test] No place found');
      return null;
    }

    const photos = place.photos?.slice(0, 5).map(photo => 
      `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=600&maxWidthPx=800&key=${GOOGLE_API_KEY}`
    ) || [];
    
    console.log('[Test] ✅ Found', photos.length, 'photos');
    console.log('[Test] First photo:', photos[0]?.substring(0, 100));
    
    return { photos };
  } catch (error) {
    console.error('[Test] Exception:', error.message);
    return null;
  }
}

searchPlace('BCD Tofu House').then(result => {
  console.log('[Test] Final result:', result ? `${result.photos.length} photos` : 'null');
});
