# ScamExplain AI - Render + Netlify Deployment

## 🚀 Deployment Strategy: Render (Backend) + Netlify (Frontend)

### 🔧 Step 1: Deploy Backend to Render

1. **Push backend to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend for Render"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Connect GitHub repo (backend folder)
   - Service Type: Web Service
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add Environment Variable: `GEMINI_API_KEY=your_key`

3. **Get your Render URL:**
   - Copy URL: `https://your-app-name.onrender.com`

### 🌐 Step 2: Deploy Frontend to Netlify

1. **Update API URL in frontend/public/script.js:**
   ```javascript
   const API_BASE_URL = 'https://your-app-name.onrender.com';
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag `frontend/public` folder to deploy
   - Or connect GitHub repo

## 🔑 Environment Variables

**Render Backend:**
```
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=production
```

## 🧪 Local Testing

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📱 Features
- ✅ 15+ Scam Types Detection
- ✅ Google Gemini AI Integration  
- ✅ Smart Fallback System
- ✅ Render + Netlify Deployment
- ✅ CORS Enabled
- ✅ Production Ready

## 💡 Alternative Deployment Options:

1. **Vercel (Frontend) + Render (Backend)**
2. **GitHub Pages (Frontend) + Railway (Backend)**
3. **Netlify (Frontend) + Railway (Backend)**