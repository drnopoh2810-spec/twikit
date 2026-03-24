# 🐦 Twitter API Dashboard - لوحة تحكم كاملة

لوحة تحكم شاملة لإدارة حسابات تويتر ونشر التغريدات برمجياً مع دعم الصور والفيديو.

## ✨ المميزات

- 🔐 نظام تسجيل دخول آمن مع JWT
- 📱 إدارة حسابات تويتر متعددة
- 🍪 إضافة حسابات من Cookie Editor
- 🔑 إنشاء مفاتيح API مع صلاحيات مخصصة
- ✍️ نشر تغريدات نصية
- 📸 نشر تغريدات مع صور (حتى 4 صور)
- 🎥 نشر تغريدات مع فيديو
- 📊 لوحة تحكم عربية سهلة الاستخدام
- 🐳 جاهز للنشر على Docker و HuggingFace Spaces

## 🚀 التثبيت والتشغيل

### باستخدام Docker

\`\`\`bash
docker compose up -d
\`\`\`

### باستخدام Node.js

\`\`\`bash
npm install
npm run build
npm start
\`\`\`

سيعمل التطبيق على: `http://localhost:7860`

## 📖 دليل الاستخدام

### 1. إنشاء حساب

1. افتح `http://localhost:7860/login.html`
2. اضغط على "حساب جديد"
3. أدخل اسم المستخدم وكلمة المرور
4. اضغط "إنشاء حساب"

### 2. إضافة حساب تويتر

#### الطريقة الأولى: تسجيل دخول تلقائي

1. من لوحة التحكم، اذهب إلى "حسابات تويتر"
2. اضغط "تسجيل دخول تلقائي"
3. أدخل بيانات حساب تويتر
4. (اختياري) أضف Proxy لتجنب الحظر

#### الطريقة الثانية: من Cookie Editor

1. ثبت إضافة [Cookie Editor](https://cookie-editor.cgagnier.ca/) على متصفحك
2. سجل دخول على twitter.com
3. افتح Cookie Editor واضغط "Export" → "JSON"
4. من لوحة التحكم، اضغط "إضافة من Cookies"
5. الصق الـ JSON في الحقل
6. ابحث عن قيمة `ct0` والصقها في حقل ct0
7. اضغط "إضافة الحساب"

### 3. إنشاء API Key

1. اذهب إلى تبويب "مفاتيح API"
2. أدخل اسم للمفتاح
3. اختر الصلاحيات المطلوبة
4. اضغط "إنشاء المفتاح"
5. احفظ المفتاح في مكان آمن

### 4. نشر تغريدة

#### من لوحة التحكم

1. اذهب إلى تبويب "نشر تغريدة"
2. اختر الحساب
3. اكتب التغريدة
4. (اختياري) أضف صور أو فيديو
5. اضغط "نشر التغريدة"

#### باستخدام API

##### نشر تغريدة نصية

\`\`\`bash
curl -X POST http://localhost:7860/api/tweet \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "accountId": "account-id-here",
    "text": "مرحباً بالعالم! 🌍"
  }'
\`\`\`

##### نشر تغريدة مع صورة

\`\`\`bash
curl -X POST http://localhost:7860/api/tweet/media \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "accountId=account-id-here" \\
  -F "text=تغريدة مع صورة 📸" \\
  -F "media=@image.jpg"
\`\`\`

##### نشر تغريدة مع فيديو

\`\`\`bash
curl -X POST http://localhost:7860/api/tweet/media \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "accountId=account-id-here" \\
  -F "text=تغريدة مع فيديو 🎥" \\
  -F "media=@video.mp4"
\`\`\`

##### نشر تغريدة مع صور متعددة

\`\`\`bash
curl -X POST http://localhost:7860/api/tweet/media \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "accountId=account-id-here" \\
  -F "text=تغريدة مع صور متعددة 🖼️" \\
  -F "media=@image1.jpg" \\
  -F "media=@image2.jpg" \\
  -F "media=@image3.jpg"
\`\`\`

## 💻 أمثلة البرمجة

### JavaScript / Node.js

\`\`\`javascript
const apiKey = 'YOUR_API_KEY';
const accountId = 'account-id-here';

// نشر تغريدة نصية
async function postTweet(text) {
  const response = await fetch('http://localhost:7860/api/tweet', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accountId: accountId,
      text: text
    })
  });
  
  return await response.json();
}

// نشر تغريدة مع صورة
async function postTweetWithImage(text, imagePath) {
  const fs = require('fs');
  const FormData = require('form-data');
  
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

// استخدام
postTweet('مرحباً من JavaScript! 👋');
postTweetWithImage('صورة جميلة 📸', './image.jpg');
\`\`\`

### Python

\`\`\`python
import requests

API_KEY = 'YOUR_API_KEY'
ACCOUNT_ID = 'account-id-here'
BASE_URL = 'http://localhost:7860'

# نشر تغريدة نصية
def post_tweet(text):
    response = requests.post(
        f'{BASE_URL}/api/tweet',
        headers={'X-API-Key': API_KEY},
        json={
            'accountId': ACCOUNT_ID,
            'text': text
        }
    )
    return response.json()

# نشر تغريدة مع صورة
def post_tweet_with_image(text, image_path):
    with open(image_path, 'rb') as image_file:
        response = requests.post(
            f'{BASE_URL}/api/tweet/media',
            headers={'X-API-Key': API_KEY},
            data={
                'accountId': ACCOUNT_ID,
                'text': text
            },
            files={'media': image_file}
        )
    return response.json()

# نشر تغريدة مع فيديو
def post_tweet_with_video(text, video_path):
    with open(video_path, 'rb') as video_file:
        response = requests.post(
            f'{BASE_URL}/api/tweet/media',
            headers={'X-API-Key': API_KEY},
            data={
                'accountId': ACCOUNT_ID,
                'text': text
            },
            files={'media': video_file}
        )
    return response.json()

# استخدام
result = post_tweet('مرحباً من Python! 🐍')
print(result)

result = post_tweet_with_image('صورة جميلة 📸', 'image.jpg')
print(result)

result = post_tweet_with_video('فيديو رائع 🎥', 'video.mp4')
print(result)
\`\`\`

### PHP

\`\`\`php
<?php

$apiKey = 'YOUR_API_KEY';
$accountId = 'account-id-here';
$baseUrl = 'http://localhost:7860';

// نشر تغريدة نصية
function postTweet($text) {
    global $apiKey, $accountId, $baseUrl;
    
    $ch = curl_init("$baseUrl/api/tweet");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'accountId' => $accountId,
        'text' => $text
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// نشر تغريدة مع صورة
function postTweetWithImage($text, $imagePath) {
    global $apiKey, $accountId, $baseUrl;
    
    $ch = curl_init("$baseUrl/api/tweet/media");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'accountId' => $accountId,
        'text' => $text,
        'media' => new CURLFile($imagePath)
    ]);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// استخدام
$result = postTweet('مرحباً من PHP! 🐘');
print_r($result);

$result = postTweetWithImage('صورة جميلة 📸', 'image.jpg');
print_r($result);

?>
\`\`\`

## 🔒 الأمان

- كلمات المرور مشفرة بـ SHA-256
- JWT tokens لمدة 7 أيام
- API Keys فريدة لكل مستخدم
- صلاحيات مخصصة لكل مفتاح

## 📁 هيكل المشروع

\`\`\`
├── src/
│   ├── server.ts          # الخادم الرئيسي
│   ├── Twitter.ts         # مكتبة تسجيل الدخول
│   ├── twitter-api.ts     # عميل Twitter API
│   ├── database.ts        # إدارة قاعدة البيانات
│   ├── auth.ts            # المصادقة والتفويض
│   └── keepalive.ts       # Keep-alive للخادم
├── public/
│   ├── dashboard.html     # لوحة التحكم
│   ├── dashboard.css      # تنسيقات لوحة التحكم
│   ├── dashboard.js       # منطق لوحة التحكم
│   ├── login.html         # صفحة تسجيل الدخول
│   └── index.html         # الصفحة الرئيسية
├── data/
│   └── db.json           # قاعدة البيانات (يتم إنشاؤها تلقائياً)
└── uploads/              # ملفات الوسائط المؤقتة
\`\`\`

## 🌐 النشر على HuggingFace Spaces

1. أنشئ Space جديد على HuggingFace
2. اختر Docker SDK
3. ارفع الملفات أو اربط مع GitHub
4. سيتم النشر تلقائياً

## ⚠️ ملاحظات مهمة

1. **استخدم Proxy**: لتجنب حظر IP من تويتر
2. **احفظ API Keys**: لا يمكن استرجاعها بعد الإنشاء
3. **حدود تويتر**: احترم حدود النشر (لا تسبام)
4. **الأمان**: غير `JWT_SECRET` في الإنتاج

## 📝 الترخيص

MIT License - استخدم بحرية!

## 👨‍💻 المطور

[cy4udev](https://cy4u.dev)

---

صنع بـ ❤️ للمطورين العرب
