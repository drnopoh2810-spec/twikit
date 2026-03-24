import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ==================== Types ====================

export interface User {
    id: string;
    username: string;
    password: string; // hashed
    createdAt: string;
}

export interface TwitterAccount {
    id: string;
    userId: string;
    twitterUsername: string;
    cookie: string;
    ct0: string;
    createdAt: string;
    lastUsed: string;
}

export interface ApiKey {
    id: string;
    userId: string;
    key: string;
    name: string;
    permissions: string[];
    createdAt: string;
    lastUsed?: string;
}

interface Database {
    users: User[];
    accounts: TwitterAccount[];
    apiKeys: ApiKey[];
}

// ==================== Database Manager ====================

class DatabaseManager {
    private dbPath: string;
    private db: Database;

    constructor() {
        this.dbPath = path.join(process.cwd(), 'data', 'db.json');
        this.ensureDataDir();
        this.db = this.load();
    }

    private ensureDataDir(): void {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    private load(): Database {
        if (fs.existsSync(this.dbPath)) {
            const data = fs.readFileSync(this.dbPath, 'utf-8');
            return JSON.parse(data);
        }
        return { users: [], accounts: [], apiKeys: [] };
    }

    private save(): void {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2));
    }

    // ==================== Users ====================

    createUser(username: string, password: string): User {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const user: User = {
            id: crypto.randomUUID(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };
        this.db.users.push(user);
        this.save();
        return user;
    }

    findUserByUsername(username: string): User | undefined {
        return this.db.users.find(u => u.username === username);
    }

    findUserById(id: string): User | undefined {
        return this.db.users.find(u => u.id === id);
    }

    verifyPassword(username: string, password: string): User | null {
        const user = this.findUserByUsername(username);
        if (!user) return null;
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        return user.password === hashedPassword ? user : null;
    }

    // ==================== Twitter Accounts ====================

    addAccount(userId: string, twitterUsername: string, cookie: string, ct0: string): TwitterAccount {
        const account: TwitterAccount = {
            id: crypto.randomUUID(),
            userId,
            twitterUsername,
            cookie,
            ct0,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
        };
        this.db.accounts.push(account);
        this.save();
        return account;
    }

    getAccountsByUserId(userId: string): TwitterAccount[] {
        return this.db.accounts.filter(a => a.userId === userId);
    }

    getAccountById(id: string): TwitterAccount | undefined {
        return this.db.accounts.find(a => a.id === id);
    }

    updateAccountLastUsed(id: string): void {
        const account = this.getAccountById(id);
        if (account) {
            account.lastUsed = new Date().toISOString();
            this.save();
        }
    }

    deleteAccount(id: string, userId: string): boolean {
        const index = this.db.accounts.findIndex(a => a.id === id && a.userId === userId);
        if (index === -1) return false;
        this.db.accounts.splice(index, 1);
        this.save();
        return true;
    }

    // ==================== API Keys ====================

    createApiKey(userId: string, name: string, permissions: string[]): ApiKey {
        const key = 'sk_' + crypto.randomBytes(32).toString('hex');
        const apiKey: ApiKey = {
            id: crypto.randomUUID(),
            userId,
            key,
            name,
            permissions,
            createdAt: new Date().toISOString(),
        };
        this.db.apiKeys.push(apiKey);
        this.save();
        return apiKey;
    }

    getApiKeysByUserId(userId: string): ApiKey[] {
        return this.db.apiKeys.filter(k => k.userId === userId);
    }

    findApiKeyByKey(key: string): ApiKey | undefined {
        return this.db.apiKeys.find(k => k.key === key);
    }

    updateApiKeyLastUsed(key: string): void {
        const apiKey = this.findApiKeyByKey(key);
        if (apiKey) {
            apiKey.lastUsed = new Date().toISOString();
            this.save();
        }
    }

    deleteApiKey(id: string, userId: string): boolean {
        const index = this.db.apiKeys.findIndex(k => k.id === id && k.userId === userId);
        if (index === -1) return false;
        this.db.apiKeys.splice(index, 1);
        this.save();
        return true;
    }
}

export const db = new DatabaseManager();
