// ==================== Global State ====================

let token = localStorage.getItem('token');
let currentUser = null;
let accounts = [];
let apiKeys = [];

// ==================== Init ====================

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    initDashboard();
    setupEventListeners();
});

async function initDashboard() {
    try {
        await loadAccounts();
        await loadApiKeys();
        updateUsername();
    } catch (error) {
        console.error('Init error:', error);
        if (error.message === 'Unauthorized') {
            logout();
        }
    }
}

function updateUsername() {
    const payload = parseJwt(token);
    document.getElementById('username').textContent = payload.userId || 'User';
}

// ==================== Event Listeners ====================

function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });

    // Twitter Login Form
    document.getElementById('twitter-login-form').addEventListener('submit', handleTwitterLogin);

    // Cookie Form
    document.getElementById('cookie-form').addEventListener('submit', handleCookieAdd);

    // API Key Form
    document.getElementById('api-key-form').addEventListener('submit', handleApiKeyCreate);

    // Tweet Form
    document.getElementById('tweet-form').addEventListener('submit', handleTweetPost);
    document.getElementById('tweet-text').addEventListener('input', updateCharCount);
    document.getElementById('tweet-media').addEventListener('change', handleMediaSelect);
}

// ==================== Tab Switching ====================

function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Update page title
    const titles = {
        'accounts': 'حسابات تويتر',
        'api-keys': 'مفاتيح API',
        'tweet': 'نشر تغريدة',
        'docs': 'التوثيق'
    };
    document.getElementById('page-title').textContent = titles[tabName];

    // Load tweet accounts if on tweet tab
    if (tabName === 'tweet') {
        loadTweetAccounts();
    }
}

// ==================== API Calls ====================

async function apiCall(endpoint, options = {}) {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 401) {
        throw new Error('Unauthorized');
    }

    return response.json();
}

// ==================== Accounts ====================

async function loadAccounts() {
    const data = await apiCall('/api/accounts');
    accounts = data.accounts;
    renderAccounts();
}

function renderAccounts() {
    const container = document.getElementById('accounts-list');
    
    if (accounts.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد حسابات. أضف حسابك الأول!</p>';
        return;
    }

    container.innerHTML = accounts.map(account => `
        <div class="account-item">
            <div class="account-info">
                <h4>@${account.twitterUsername}</h4>
                <p>تم الإضافة: ${new Date(account.createdAt).toLocaleDateString('ar')}</p>
                <p>آخر استخدام: ${new Date(account.lastUsed).toLocaleDateString('ar')}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteAccount('${account.id}')">حذف</button>
        </div>
    `).join('');
}

function showLoginForm() {
    document.getElementById('twitter-login-form').classList.remove('hidden');
    document.getElementById('cookie-form').classList.add('hidden');
}

function showCookieForm() {
    document.getElementById('cookie-form').classList.remove('hidden');
    document.getElementById('twitter-login-form').classList.add('hidden');
}

async function handleTwitterLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('tw-username').value;
    const password = document.getElementById('tw-password').value;
    const email = document.getElementById('tw-email').value;
    const proxy = document.getElementById('tw-proxy').value;

    try {
        const response = await fetch('/api/twitter/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, proxy }),
        });

        const result = await response.json();

        if (result.success) {
            await apiCall('/api/accounts', {
                method: 'POST',
                body: JSON.stringify({
                    twitterUsername: username,
                    cookie: result.cookie,
                    ct0: result.ct0,
                }),
            });

            alert('تم إضافة الحساب بنجاح!');
            document.getElementById('twitter-login-form').reset();
            document.getElementById('twitter-login-form').classList.add('hidden');
            await loadAccounts();
        } else {
            alert('فشل تسجيل الدخول: ' + result.error);
        }
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

async function handleCookieAdd(e) {
    e.preventDefault();

    const twitterUsername = document.getElementById('cookie-username').value;
    const cookieValue = document.getElementById('cookie-value').value;
    const ct0 = document.getElementById('ct0-value').value;

    try {
        let requestBody;

        // Check if it's JSON format (from Cookie Editor)
        if (cookieValue.trim().startsWith('[')) {
            requestBody = {
                twitterUsername,
                cookiesJson: cookieValue,
                ct0: ct0 || undefined
            };
        } else {
            // Plain cookie string
            requestBody = {
                twitterUsername,
                cookie: cookieValue,
                ct0
            };
        }

        await apiCall('/api/accounts', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        alert('تم إضافة الحساب بنجاح!');
        document.getElementById('cookie-form').reset();
        document.getElementById('cookie-form').classList.add('hidden');
        await loadAccounts();
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

async function deleteAccount(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;

    try {
        await apiCall(`/api/accounts/${id}`, { method: 'DELETE' });
        alert('تم حذف الحساب بنجاح!');
        await loadAccounts();
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

// ==================== API Keys ====================

async function loadApiKeys() {
    const data = await apiCall('/api/keys');
    apiKeys = data.keys;
    renderApiKeys();
}

function renderApiKeys() {
    const container = document.getElementById('api-keys-list');
    
    if (apiKeys.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد مفاتيح API. أنشئ مفتاحك الأول!</p>';
        return;
    }

    container.innerHTML = apiKeys.map(key => `
        <div class="api-key-item">
            <div class="key-info">
                <h4>${key.name}</h4>
                <div class="key-value">${key.key}</div>
                <p>الصلاحيات: ${key.permissions.join(', ')}</p>
                <p>تم الإنشاء: ${new Date(key.createdAt).toLocaleDateString('ar')}</p>
                ${key.lastUsed ? `<p>آخر استخدام: ${new Date(key.lastUsed).toLocaleDateString('ar')}</p>` : ''}
            </div>
            <button class="btn btn-danger" onclick="deleteApiKey('${key.id}')">حذف</button>
        </div>
    `).join('');
}

async function handleApiKeyCreate(e) {
    e.preventDefault();

    const name = document.getElementById('key-name').value;
    const permissions = Array.from(document.querySelectorAll('.permissions input:checked'))
        .map(input => input.value);

    if (permissions.length === 0) {
        alert('يجب اختيار صلاحية واحدة على الأقل');
        return;
    }

    try {
        await apiCall('/api/keys', {
            method: 'POST',
            body: JSON.stringify({ name, permissions }),
        });

        alert('تم إنشاء المفتاح بنجاح!');
        document.getElementById('api-key-form').reset();
        await loadApiKeys();
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

async function deleteApiKey(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المفتاح؟')) return;

    try {
        await apiCall(`/api/keys/${id}`, { method: 'DELETE' });
        alert('تم حذف المفتاح بنجاح!');
        await loadApiKeys();
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

// ==================== Tweet ====================

function loadTweetAccounts() {
    const select = document.getElementById('tweet-account');
    select.innerHTML = '<option value="">اختر الحساب</option>' +
        accounts.map(acc => `<option value="${acc.id}">@${acc.twitterUsername}</option>`).join('');
}

function updateCharCount() {
    const text = document.getElementById('tweet-text').value;
    document.getElementById('char-count').textContent = text.length;
}

function handleMediaSelect(e) {
    const files = e.target.files;
    const preview = document.getElementById('media-preview');
    preview.innerHTML = '';

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const isVideo = file.type.startsWith('video/');
            const element = isVideo ? 'video' : 'img';
            preview.innerHTML += `<${element} src="${e.target.result}" ${isVideo ? 'controls' : ''}></${element}>`;
        };
        reader.readAsDataURL(file);
    });
}

async function handleTweetPost(e) {
    e.preventDefault();

    const accountId = document.getElementById('tweet-account').value;
    const text = document.getElementById('tweet-text').value;
    const mediaFiles = document.getElementById('tweet-media').files;

    if (!accountId) {
        alert('يجب اختيار حساب');
        return;
    }

    if (!apiKeys.length) {
        alert('يجب إنشاء API Key أولاً من تبويب "مفاتيح API"');
        return;
    }

    const apiKey = apiKeys[0].key;

    try {
        let result;

        if (mediaFiles.length > 0) {
            const formData = new FormData();
            formData.append('accountId', accountId);
            formData.append('text', text);
            Array.from(mediaFiles).forEach(file => {
                formData.append('media', file);
            });

            const response = await fetch('/api/tweet/media', {
                method: 'POST',
                headers: { 'X-API-Key': apiKey },
                body: formData,
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'فشل نشر التغريدة');
            }
            
            result = await response.json();
        } else {
            const response = await fetch('/api/tweet', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accountId, text }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'فشل نشر التغريدة');
            }
            
            result = await response.json();
        }

        if (result.success) {
            alert('تم نشر التغريدة بنجاح! 🎉');
            document.getElementById('tweet-form').reset();
            document.getElementById('media-preview').innerHTML = '';
            updateCharCount();
        } else {
            alert('فشل نشر التغريدة: ' + (result.error || 'خطأ غير معروف'));
        }
    } catch (error) {
        console.error('Tweet error:', error);
        alert('حدث خطأ: ' + error.message + '\n\nتأكد من:\n1. الـ Cookies صحيحة ومحدثة\n2. الحساب غير محظور\n3. النص أقل من 280 حرف');
    }
}

// ==================== Utilities ====================

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return {};
    }
}
