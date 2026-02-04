
// Native fetch is available in Node 18+

const TEAM_ID = '3ce8c512-d349-4d57-87e5-d6f304a17d5f';
const TOKEN_URL = 'https://mint.club/token/base/KIND';
const API_URL = `https://www.openwork.bot/api/hackathon/${TEAM_ID}`;

async function main() {
  const apiKey = process.env.OPENWORK_API_KEY;

  if (!apiKey) {
    console.error('❌ OPENWORK_API_KEY is missing from environment variables.');
    process.exit(1);
  }

  console.log(`🔌 Registering Token URL for Team Kindred (${TEAM_ID})...`);
  console.log(`   URL: ${TOKEN_URL}`);

  try {
    const response = await fetch(API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token_url: TOKEN_URL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Success! Token URL registered.');
    console.log('Response:', data);

  } catch (error: any) {
    console.error('❌ Registration failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
