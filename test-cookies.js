// Test script to verify Twitter cookies
const axios = require('axios');

// Replace with your actual cookies
const COOKIE = 'auth_token=YOUR_AUTH_TOKEN; ct0=YOUR_CT0_TOKEN; guest_id=v1%3A123; twid=u%3D456';
const CT0 = 'YOUR_CT0_TOKEN';

async function testCookies() {
    console.log('🔍 Testing Twitter cookies...\n');

    try {
        // Test 1: Verify credentials
        console.log('Test 1: Verifying credentials...');
        const response = await axios.get(
            'https://twitter.com/i/api/1.1/account/verify_credentials.json',
            {
                headers: {
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'cookie': COOKIE,
                    'x-csrf-token': CT0,
                    'x-twitter-active-user': 'yes',
                    'x-twitter-auth-type': 'OAuth2Session',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                },
                params: {
                    include_entities: false,
                    skip_status: true,
                    include_email: false
                }
            }
        );

        console.log('✅ Cookies are valid!');
        console.log('Username:', response.data.screen_name);
        console.log('Name:', response.data.name);
        console.log('ID:', response.data.id_str);
        console.log('\n✨ You can use these cookies in the dashboard!\n');

    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.statusText);
        console.error('Message:', error.response?.data?.errors?.[0]?.message || error.message);
        console.log('\n⚠️  Possible issues:');
        console.log('1. Cookies are expired or invalid');
        console.log('2. ct0 token is incorrect');
        console.log('3. auth_token is missing or wrong');
        console.log('\n💡 Solution: Get fresh cookies from Cookie Editor');
    }
}

// Instructions
console.log('═══════════════════════════════════════════════════════');
console.log('📝 How to use this test:');
console.log('═══════════════════════════════════════════════════════');
console.log('1. Open this file (test-cookies.js)');
console.log('2. Replace COOKIE and CT0 with your actual values');
console.log('3. Run: node test-cookies.js');
console.log('═══════════════════════════════════════════════════════\n');

testCookies();
