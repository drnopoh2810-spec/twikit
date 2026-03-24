// ==================== Cookie Parser ====================

interface CookieItem {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
}

export function parseCookiesFromJSON(cookiesJson: string): { cookie: string; ct0: string | null } {
    try {
        const cookies: CookieItem[] = JSON.parse(cookiesJson);
        
        // Convert to cookie string
        const cookieString = cookies
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        
        // Extract ct0
        const ct0Cookie = cookies.find(c => c.name === 'ct0');
        const ct0 = ct0Cookie ? ct0Cookie.value : null;
        
        return { cookie: cookieString, ct0 };
    } catch (error) {
        throw new Error('Invalid cookies JSON format');
    }
}

export function validateCookies(cookie: string, ct0: string): boolean {
    // Check if cookie contains essential tokens
    const hasAuthToken = cookie.includes('auth_token=');
    const hasCt0 = cookie.includes('ct0=');
    
    if (!hasAuthToken) {
        throw new Error('Missing auth_token in cookies');
    }
    
    if (!hasCt0 && !ct0) {
        throw new Error('Missing ct0 token');
    }
    
    return true;
}
