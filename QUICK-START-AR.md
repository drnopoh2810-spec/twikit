# 🚀 دليل البدء السريع

## الخطوة 1: تشغيل المشروع

### باستخدام Docker (الأسهل)
```bash
docker compose up -d
```

### باستخدام Node.js
```bash
npm install
npm run build
npm start
```

افتح المتصفح على: `http://localhost:7860`

---

## الخطوة 2: إنشاء حساب

1. اذهب إلى `http://localhost:7860/login.html`
2. اضغط "حساب جديد"
3. أدخل:
   - اسم المستخدم: `admin`
   - كلمة المرور: `password123`
4. اضغط "إنشاء حساب"

✅ تم! سيتم تسجيل دخولك تلقائياً

---

## الخطوة 3: إضافة حساب تويتر

### الطريقة السهلة: من Cookie Editor

1. ثبت [Cookie Editor](https://cookie-editor.cgagnier.ca/)
2. سجل دخول على [twitter.com](https://twitter.com)
3. افتح Cookie Editor
4. اضغط "Export" → اختر "JSON"
5. انسخ كل المحتوى
6. في لوحة التحكم:
   - اضغط "إضافة من Cookies"
   - الصق JSON في الحقل الأول
   - ابحث عن `"name": "ct0"` في JSON
   - انسخ قيمة `"value"` والصقها في حقل ct0
   - أدخل اسم المستخدم على تويتر
   - اضغط "إضافة الحساب"

✅ تم! حسابك جاهز للاستخدام

---

## الخطوة 4: إنشاء API Key

1. اذهب إلى تبويب "مفاتيح API"
2. أدخل اسم: `My First Key`
3. اختر كل الصلاحيات
4. اضغط "إنشاء المفتاح"
5. **احفظ المفتاح!** (لن تراه مرة أخرى)

✅ مفتاحك جاهز!

---

## الخطوة 5: نشر أول تغريدة

### من لوحة التحكم:

1. اذهب إلى "نشر تغريدة"
2. اختر الحساب
3. اكتب: `مرحباً بالعالم! 🌍`
4. اضغط "نشر التغريدة"

### من Terminal:

```bash
curl -X POST http://localhost:7860/api/tweet \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "YOUR_ACCOUNT_ID",
    "text": "مرحباً من API! 🚀"
  }'
```

✅ تغريدتك الأولى نُشرت!

---

## الخطوة 6: نشر تغريدة مع صورة

```bash
curl -X POST http://localhost:7860/api/tweet/media \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -F "accountId=YOUR_ACCOUNT_ID" \
  -F "text=صورة جميلة 📸" \
  -F "media=@/path/to/image.jpg"
```

---

## 🎯 أمثلة سريعة

### Python
```python
import requests

API_KEY = 'your-api-key'
ACCOUNT_ID = 'your-account-id'

# نشر تغريدة
response = requests.post(
    'http://localhost:7860/api/tweet',
    headers={'X-API-Key': API_KEY},
    json={
        'accountId': ACCOUNT_ID,
        'text': 'مرحباً من Python! 🐍'
    }
)
print(response.json())
```

### JavaScript
```javascript
const apiKey = 'your-api-key';
const accountId = 'your-account-id';

fetch('http://localhost:7860/api/tweet', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    accountId: accountId,
    text: 'مرحباً من JavaScript! 👋'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🔍 كيف أحصل على Account ID؟

1. اذهب إلى "حسابات تويتر" في لوحة التحكم
2. افتح Developer Tools (F12)
3. اذهب إلى Console
4. اكتب: `accounts`
5. ستجد قائمة بحساباتك مع الـ `id` لكل حساب

أو استخدم API:
```bash
curl http://localhost:7860/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚠️ نصائح مهمة

1. **استخدم Proxy** عند تسجيل الدخول التلقائي لتجنب الحظر
2. **لا تنشر أكثر من 300 تغريدة كل 3 ساعات**
3. **احفظ API Keys في مكان آمن**
4. **لا تشارك الـ cookies مع أحد**

---

## 🆘 حل المشاكل

### خطأ 403 عند تسجيل الدخول؟
- استخدم Proxy
- جرب من IP مختلف
- تأكد من صحة البيانات

### لا تظهر التغريدة؟
- تحقق من Account ID
- تأكد من صحة API Key
- راجع الـ Console للأخطاء

### الصورة لا ترفع؟
- تأكد من حجم الصورة (أقل من 5MB)
- استخدم صيغة JPG أو PNG
- تحقق من مسار الملف

---

## 📚 المزيد من التوثيق

- [README-AR.md](README-AR.md) - دليل كامل
- [API-DOCS.md](API-DOCS.md) - توثيق API
- [README.md](README.md) - English version

---

## 💬 الدعم

واجهت مشكلة؟ افتح Issue على GitHub!

---

صنع بـ ❤️ للمطورين العرب
