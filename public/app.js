// ==================== Login Demo ====================

const form = document.getElementById('loginForm');
const resultBox = document.getElementById('resultBox');
const statusBadge = document.getElementById('statusBadge');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');

function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Logging in...' : 'Login';
    btnSpinner.classList.toggle('hidden', !loading);
}

function showResult(data, ok) {
    resultBox.textContent = JSON.stringify(data, null, 2);
    statusBadge.textContent = ok ? '200 OK' : '401 Error';
    statusBadge.className = 'status-badge ' + (ok ? 'ok' : 'err');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);
    statusBadge.textContent = '';
    statusBadge.className = 'status-badge';
    resultBox.textContent = '// Sending request...';

    const body = {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
        email: document.getElementById('email').value.trim() || undefined,
        proxy: document.getElementById('proxy').value.trim() || undefined,
    };

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        showResult(data, res.ok);
    } catch (err) {
        showResult({ success: false, error: err.message }, false);
    } finally {
        setLoading(false);
    }
});

// ==================== Status check on load ====================

async function checkStatus() {
    try {
        const res = await fetch('/health');
        const data = await res.json();
        console.log('[status]', data);
    } catch {
        console.warn('[status] server unreachable');
    }
}

checkStatus();
