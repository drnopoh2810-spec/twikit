import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
    userId?: string;
    user?: any;
}

// ==================== JWT Helpers ====================

export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

// ==================== Middleware ====================

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }

    const user = db.findUserById(decoded.userId);
    if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
}

export function apiKeyMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
        res.status(401).json({ error: 'No API key provided' });
        return;
    }

    const key = db.findApiKeyByKey(apiKey);
    if (!key) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }

    db.updateApiKeyLastUsed(apiKey);
    req.userId = key.userId;
    req.user = { apiKey: key };
    next();
}
