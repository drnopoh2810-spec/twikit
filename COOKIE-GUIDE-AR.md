# 🍪 دليل استخراج Cookies من تويتر

## الطريقة الصحيحة 100%

### الخطوة 1: تثبيت Cookie Editor

اختر حسب متصفحك:

**Chrome / Edge / Brave:**
https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm

**Firefox:**
https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/

---

### الخطوة 2: تسجيل الدخول على تويتر

1. اذهب إلى https://twitter.com (أو https://x.com)
2. سجل دخول بحسابك
3. تأكد إنك شايف الصفحة الرئيسية (Home Timeline)
4. **مهم:** لا تستخدم Incognito/Private mode

---

### الخطوة 3: استخراج الـ Cookies

1. **اضغط على أيقونة Cookie Editor** في شريط الأدوات
2. **اضغط "Export"** في الأسفل
3. **اختر "JSON"** من القائمة
4. **انسخ كل المحتوى** (Ctrl+A ثم Ctrl+C)

يجب أن يبدو هكذا:
```json
[
  {
    "domain": ".x.com",
    "name": "auth_token",
    "value": "abc123..."
  },
  {
    "domain": ".x.com",
    "name": "ct0",
    "value": "xyz789..."
  },
  ...
]
```

---

### الخطوة 4: إضافة في لوحة التحكم

1. افتح لوحة التحكم
2. اذهب إلى "حسابات تويتر"
3. اضغط "إضافة من Cookies"
4. **الصق JSON كامل** في الحقل الأول
5. أدخل اسم المستخدم على تويتر (بدون @)
6. اضغط "إضافة الحساب"

✅ **لا تحتاج** لنسخ ct0 يدوياً!

---

## ✅ التحقق من الـ Cookies

### الطريقة 1: من المتصفح

1. افتح Developer Tools (F12)
2. اذهب إلى Console
3. الصق هذا الكود:

```javascript
fetch('https://twitter.com/i/api/1.1/account/verify_credentials.json', {
  headers: {
    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Valid!', d.screen_name))
.catch(e => console.log('❌ Invalid!', e));
```

إذا ظهر اسم المستخدم، الـ Cookies صحيحة! ✅

### الطريقة 2: باستخدام test-cookies.js

1. افتح ملف `test-cookies.js`
2. ضع الـ cookies بتاعتك
3. شغل:
```bash
node test-cookies.js
```

---

## 🔍 الـ Cookies المطلوبة

يجب أن يحتوي JSON على هذه الـ cookies:

| Cookie | الوصف | مطلوب؟ |
|--------|-------|--------|
| `auth_token` | توكن المصادقة | ✅ نعم |
| `ct0` | CSRF token | ✅ نعم |
| `guest_id` | معرف الزائر | ⚠️ مستحسن |
| `twid` | معرف المستخدم | ⚠️ مستحسن |
| `kdt` | توكن إضافي | ⚠️ مستحسن |

---

## ❌ أخطاء شائعة

### 1. نسخ Cookies من مكان خاطئ

❌ **خطأ:** نسخ من Developer Tools → Application → Cookies
✅ **صح:** استخدام Cookie Editor

### 2. نسخ جزء من JSON فقط

❌ **خطأ:** نسخ cookie واحد فقط
✅ **صح:** نسخ كل الـ JSON من [ إلى ]

### 3. تسجيل الدخول في Incognito

❌ **خطأ:** استخدام Private/Incognito mode
✅ **صح:** استخدام النافذة العادية

### 4. Cookies منتهية

❌ **خطأ:** استخدام cookies قديمة
✅ **صح:** استخراج cookies جديدة كل أسبوع

---

## 🔄 متى تحدث الـ Cookies؟

حدّث الـ Cookies في هذه الحالات:

- ✅ كل أسبوع (للأمان)
- ✅ بعد تغيير كلمة المرور
- ✅ بعد تسجيل الخروج وإعادة الدخول
- ✅ عند ظهور خطأ 401 أو 403
- ✅ عند فشل نشر التغريدات

---

## 🛡️ نصائح الأمان

1. **لا تشارك الـ Cookies** مع أي شخص
2. **احذف الـ Cookies القديمة** من لوحة التحكم
3. **استخدم حسابات اختبار** للتجربة
4. **فعّل 2FA** على حسابك الأساسي
5. **غير كلمة السر** بعد الانتهاء من التجربة

---

## 📱 استخراج من الموبايل

### Android (Chrome):

1. ثبت Kiwi Browser (يدعم Extensions)
2. ثبت Cookie Editor
3. افتح twitter.com في Kiwi
4. استخدم Cookie Editor

### iOS (Safari):

للأسف، Safari لا يدعم Extensions بشكل كامل.
**الحل:** استخدم جهاز كمبيوتر أو:
1. استخدم تطبيق Inspect Browser
2. أو استخدم Remote Debugging

---

## 🆘 لو لسه مش شغال

جرب الخطوات دي:

1. ✅ امسح كل الـ Cookies من المتصفح
2. ✅ سجل خروج من تويتر
3. ✅ أغلق المتصفح تماماً
4. ✅ افتح المتصفح من جديد
5. ✅ سجل دخول على تويتر
6. ✅ استخرج الـ Cookies من جديد

---

## 💡 نصيحة ذهبية

**أفضل طريقة:**
- استخدم Cookie Editor
- حدّث الـ Cookies كل أسبوع
- احتفظ بنسخة احتياطية من JSON

---

## 📞 الدعم

لو جربت كل الطرق ولسه مش شغال:
1. افتح Issue على GitHub
2. أرفق screenshot من Cookie Editor
3. أرفق رسالة الخطأ

---

صنع بـ ❤️ للمطورين العرب
