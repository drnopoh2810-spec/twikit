# Twitter API Dashboard - API Documentation

## Base URL
```
http://localhost:7860
```

## Authentication

### User Authentication (JWT)
Include JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### API Key Authentication
Include API key in X-API-Key header:
```
X-API-Key: YOUR_API_KEY
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "version": "3.0.0",
  "timestamp": "2024-03-24T12:00:00.000Z",
  "uptime": 3600
}
```

---

### 2. Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "myusername",
  "password": "mypassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "myusername"
  }
}
```

---

### 3. Login User

**POST** `/api/auth/login`

Login to existing account.

**Request Body:**
```json
{
  "username": "myusername",
  "password": "mypassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "myusername"
  }
}
```

---

### 4. Twitter Login

**POST** `/api/twitter/login`

Login to Twitter account (no auth required).

**Request Body:**
```json
{
  "username": "twitter_username",
  "password": "twitter_password",
  "email": "optional@email.com",
  "twoFactorCode": "123456",
  "checkpointCode": "123456",
  "proxy": "http://user:pass@host:port",
  "language": "en",
  "delayMs": 3000
}
```

**Response:**
```json
{
  "success": true,
  "ct0": "abc123...",
  "cookie": "ct0=abc123; auth_token=xyz..."
}
```

---

### 5. Get Twitter Accounts

**GET** `/api/accounts`

Get all Twitter accounts for authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": "account-uuid",
      "twitterUsername": "username",
      "createdAt": "2024-03-24T12:00:00.000Z",
      "lastUsed": "2024-03-24T12:00:00.000Z"
    }
  ]
}
```

---

### 6. Add Twitter Account

**POST** `/api/accounts`

Add a Twitter account manually (from cookies).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "twitterUsername": "username",
  "cookie": "ct0=abc; auth_token=xyz...",
  "ct0": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "account-uuid",
    "twitterUsername": "username",
    "createdAt": "2024-03-24T12:00:00.000Z"
  }
}
```

---

### 7. Delete Twitter Account

**DELETE** `/api/accounts/:id`

Delete a Twitter account.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true
}
```

---

### 8. Get API Keys

**GET** `/api/keys`

Get all API keys for authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "keys": [
    {
      "id": "key-uuid",
      "name": "My API Key",
      "key": "sk_abc123...",
      "permissions": ["tweet", "read", "media"],
      "createdAt": "2024-03-24T12:00:00.000Z",
      "lastUsed": "2024-03-24T12:00:00.000Z"
    }
  ]
}
```

---

### 9. Create API Key

**POST** `/api/keys`

Create a new API key.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "My API Key",
  "permissions": ["tweet", "read", "media"]
}
```

**Response:**
```json
{
  "success": true,
  "apiKey": {
    "id": "key-uuid",
    "name": "My API Key",
    "key": "sk_abc123...",
    "permissions": ["tweet", "read", "media"]
  }
}
```

---

### 10. Delete API Key

**DELETE** `/api/keys/:id`

Delete an API key.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true
}
```

---

### 11. Post Tweet (Text Only)

**POST** `/api/tweet`

Post a text-only tweet.

**Headers:**
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "accountId": "account-uuid",
  "text": "Hello World! 🌍"
}
```

**Response:**
```json
{
  "success": true,
  "tweet": {
    "data": {
      "id": "1234567890",
      "text": "Hello World! 🌍"
    }
  }
}
```

---

### 12. Post Tweet with Media

**POST** `/api/tweet/media`

Post a tweet with images or video.

**Headers:**
```
X-API-Key: YOUR_API_KEY
Content-Type: multipart/form-data
```

**Form Data:**
- `accountId`: Account UUID (string)
- `text`: Tweet text (string)
- `media`: Media files (file, up to 4 images or 1 video)

**Example with cURL:**
```bash
curl -X POST http://localhost:7860/api/tweet/media \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "accountId=account-uuid" \
  -F "text=Tweet with image 📸" \
  -F "media=@image.jpg"
```

**Response:**
```json
{
  "success": true,
  "tweet": {
    "data": {
      "id": "1234567890",
      "text": "Tweet with image 📸"
    }
  }
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized (invalid token/API key)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limits

- Respect Twitter's rate limits
- Recommended: Max 300 tweets per 3 hours per account
- Use delays between requests to avoid detection

---

## Media Upload Limits

- **Images**: Up to 4 images per tweet
- **Video**: 1 video per tweet (max 512MB)
- **Supported formats**: 
  - Images: JPG, PNG, GIF
  - Video: MP4, MOV

---

## Best Practices

1. **Use Proxies**: Rotate proxies to avoid IP bans
2. **Delay Requests**: Add 2-5 second delays between tweets
3. **Secure API Keys**: Never expose API keys in client-side code
4. **Handle Errors**: Implement retry logic with exponential backoff
5. **Monitor Accounts**: Check account status regularly

---

## Examples

### JavaScript/Node.js

```javascript
const apiKey = 'YOUR_API_KEY';
const accountId = 'account-uuid';

// Post text tweet
async function postTweet(text) {
  const response = await fetch('http://localhost:7860/api/tweet', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accountId, text })
  });
  return await response.json();
}

// Post tweet with image
async function postTweetWithImage(text, imagePath) {
  const FormData = require('form-data');
  const fs = require('fs');
  
  const formData = new FormData();
  formData.append('accountId', accountId);
  formData.append('text', text);
  formData.append('media', fs.createReadStream(imagePath));
  
  const response = await fetch('http://localhost:7860/api/tweet/media', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      ...formData.getHeaders()
    },
    body: formData
  });
  return await response.json();
}
```

### Python

```python
import requests

API_KEY = 'YOUR_API_KEY'
ACCOUNT_ID = 'account-uuid'

# Post text tweet
def post_tweet(text):
    response = requests.post(
        'http://localhost:7860/api/tweet',
        headers={'X-API-Key': API_KEY},
        json={'accountId': ACCOUNT_ID, 'text': text}
    )
    return response.json()

# Post tweet with image
def post_tweet_with_image(text, image_path):
    with open(image_path, 'rb') as f:
        response = requests.post(
            'http://localhost:7860/api/tweet/media',
            headers={'X-API-Key': API_KEY},
            data={'accountId': ACCOUNT_ID, 'text': text},
            files={'media': f}
        )
    return response.json()
```

---

## Support

For issues and questions, please open an issue on GitHub.

## License

MIT License
