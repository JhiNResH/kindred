import { searchPlace } from './src/lib/googlePlaces'

async function test() {
  console.log('Testing Google Places API...')
  
  const result = await searchPlace('Yuzu Japanese Sushi Bar')
  
  if (result) {
    console.log('✅ Success!')
    console.log('Name:', result.name)
    console.log('Place ID:', result.placeId)
    console.log('Photos:', result.photos?.length || 0)
    console.log('First photo:', result.photos?.[0])
  } else {
    console.log('❌ Failed - returned null')
  }
}

test()
