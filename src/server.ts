import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import multer from 'multer';
import { Twitter, TwitterConfig, LoginResult } from './Twitter';
import { startKeepAlive } from './keepalive';
import { db } from './database';
import { generateToken, authMiddleware, apiKeyMiddleware, AuthRequest } from './auth';
import { TwitterApiClient } from './twitter-api';
import { parseCookiesFromJSON, validateCookies } from './cookie-parser';

const app = express();
const PORT = parseInt(process.env.PORT ?? '7860', 10);

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ==================== Health / Status ====================

app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
    });
});

app.get('/api/status', (_req: Request, res: Response) => {
    res.json({
        name: 'Twitter Unofficial API',
        version: '3.0.0',
        status: 'running',
        endpoints: [
            { method: 'GET',  path: '/health',     desc: 'Health check' },
            { method: 'GET',  path: '/api/status', desc: 'API info' },
            { method: 'POST', path: '/api/auth/register', desc: 'Register user' },
            { method: 'POST', path: '/api/auth/login', desc: 'Login user' },
            { method: 'POST', path: '/api/twitter/login', desc: 'Login to Twitter' },
            { method: 'GET',  path: '/api/accounts', desc: 'Get Twitter accounts' },
            { method: 'POST', path: '/api/accounts', desc: 'Add Twitter account' },
            { method: 'DELETE', path: '/api/accounts/:id', desc: 'Delete account' },
            { method: 'GET',  path: '/api/keys', desc: 'Get API keys' },
            { method: 'POST', path: '/api/keys', desc: 'Create API key' },
            { method: 'DELETE', path: '/api/keys/:id', desc: 'Delete API key' },
            { method: 'POST', path: '/api/tweet', desc: 'Post tweet' },
            { method: 'POST', path: '/api/tweet/media', desc: 'Post tweet with media' },
        ],
    });
});

// ==================== Auth Endpoints ====================

app.post('/api/auth/register', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }

    if (db.findUserByUsername(username)) {
        res.status(400).json({ error: 'Username already exists' });
        return;
    }

    const user = db.createUser(username, password);
    const token = generateToken(user.id);

    res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username },
    });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }

    const user = db.verifyPassword(username, password);
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    const token = generateToken(user.id);

    res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username },
    });
});

// ==================== Twitter Login ====================

app.post('/api/twitter/login', async (req: Request, res: Response) => {
    const { username, password, email, twoFactorCode, checkpointCode, proxy, language, delayMs } = req.body;

    if (!username || !password) {
        res.status(400).json({ success: false, error: 'username and password are required' });
        return;
    }

    const config: TwitterConfig = { language: language ?? 'en' };
    if (proxy) config.proxies = proxy;

    const client = new Twitter(config);
    const result: LoginResult = await client.login(username, password, {
        email, twoFactorCode, checkpointCode, delayMs: delayMs ?? 3000,
    });

    res.status(result.success ? 200 : 401).json(result);
});

// ==================== Twitter Accounts Management ====================

app.get('/api/accounts', authMiddleware, (req: AuthRequest, res: Response) => {
    const accounts = db.getAccountsByUserId(req.userId!);
    res.json({
        success: true,
        accounts: accounts.map(a => ({
            id: a.id,
            twitterUsername: a.twitterUsername,
            createdAt: a.createdAt,
            lastUsed: a.lastUsed,
        })),
    });
});

app.post('/api/accounts', authMiddleware, (req: AuthRequest, res: Response) => {
    const { twitterUsername, cookie, ct0, cookiesJson } = req.body;

    try {
        let finalCookie = cookie;
        let finalCt0 = ct0;

        // If cookiesJson is provided, parse it
        if (cookiesJson) {
            const parsed = parseCookiesFromJSON(cookiesJson);
            finalCookie = parsed.cookie;
            finalCt0 = parsed.ct0 || ct0;
        }

        if (!twitterUsername || !finalCookie || !finalCt0) {
            res.status(400).json({ error: 'twitterUsername, cookie, and ct0 required' });
            return;
        }

        // Validate cookies
        validateCookies(finalCookie, finalCt0);

        const account = db.addAccount(req.userId!, twitterUsername, finalCookie, finalCt0);

        res.json({
            success: true,
            account: {
                id: account.id,
                twitterUsername: account.twitterUsername,
                createdAt: account.createdAt,
            },
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/accounts/:id', authMiddleware, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const deleted = db.deleteAccount(id, req.userId!);

    if (!deleted) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }

    res.json({ success: true });
});

// ==================== API Keys Management ====================

app.get('/api/keys', authMiddleware, (req: AuthRequest, res: Response) => {
    const keys = db.getApiKeysByUserId(req.userId!);
    res.json({
        success: true,
        keys: keys.map(k => ({
            id: k.id,
            name: k.name,
            key: k.key,
            permissions: k.permissions,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
        })),
    });
});

app.post('/api/keys', authMiddleware, (req: AuthRequest, res: Response) => {
    const { name, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
        res.status(400).json({ error: 'name and permissions array required' });
        return;
    }

    const apiKey = db.createApiKey(req.userId!, name, permissions);

    res.json({
        success: true,
        apiKey: {
            id: apiKey.id,
            name: apiKey.name,
            key: apiKey.key,
            permissions: apiKey.permissions,
        },
    });
});

app.delete('/api/keys/:id', authMiddleware, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const deleted = db.deleteApiKey(id, req.userId!);

    if (!deleted) {
        res.status(404).json({ error: 'API key not found' });
        return;
    }

    res.json({ success: true });
});

// ==================== Tweet Operations (with API Key) ====================

app.post('/api/tweet', apiKeyMiddleware, async (req: AuthRequest, res: Response) => {
    const { accountId, text } = req.body;

    if (!accountId || !text) {
        res.status(400).json({ error: 'accountId and text required' });
        return;
    }

    const account = db.getAccountById(accountId);
    if (!account || account.userId !== req.userId) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }

    try {
        const client = new TwitterApiClient(account.cookie, account.ct0);
        
        // Try v1 API first (more stable)
        const result = await client.postTweetV1(text);
        db.updateAccountLastUsed(accountId);

        res.json({ success: true, tweet: result });
    } catch (error: any) {
        console.error('Tweet error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.errors?.[0]?.message || error.message,
            details: error.response?.data
        });
    }
});

app.post('/api/tweet/media', apiKeyMiddleware, upload.array('media', 4), async (req: AuthRequest, res: Response) => {
    const { accountId, text } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!accountId || !text) {
        res.status(400).json({ error: 'accountId and text required' });
        return;
    }

    const account = db.getAccountById(accountId);
    if (!account || account.userId !== req.userId) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }

    try {
        const client = new TwitterApiClient(account.cookie, account.ct0);
        const mediaIds: string[] = [];

        // Upload all media files
        for (const file of files) {
            const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
            const mediaId = await client.uploadMedia(file.path, mediaType);
            mediaIds.push(mediaId);
        }

        // Post tweet with media using v1 API
        const result = await client.postTweetV1(text, mediaIds);
        db.updateAccountLastUsed(accountId);

        res.json({ success: true, tweet: result });
    } catch (error: any) {
        console.error('Tweet with media error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.errors?.[0]?.message || error.message,
            details: error.response?.data
        });
    }
});

// ==================== SPA fallback ====================

app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==================== Error Handler ====================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message });
});

// ==================== Start ====================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    startKeepAlive(PORT);
});

export default app;
