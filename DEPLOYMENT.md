# Deployment Guide for NoThinkFashion

This guide covers deploying NoThinkFashion to various hosting platforms.

---

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Free tier perfect for hackathons
- Automatic builds from GitHub
- Global CDN
- Zero config for Vite + React

**Steps:**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - NoThinkFashion"
git branch -M main
git remote add origin https://github.com/yourusername/nothinkfashion.git
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repo
- Vercel auto-detects Vite
- Click "Deploy"
- Done! 🎉

3. **Your URL**
```
https://nothinkfashion.vercel.app
```

---

### Option 2: Netlify

**Steps:**

1. **Build the project**
```bash
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Or use Netlify's drag-and-drop:
- Go to [app.netlify.com/drop](https://app.netlify.com/drop)
- Drag your `dist` folder
- Get instant URL

---

### Option 3: GitHub Pages

**Steps:**

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json**
```json
{
  "homepage": "https://yourusername.github.io/nothinkfashion",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Update vite.config.js**
```javascript
export default defineConfig({
  base: '/nothinkfashion/',
  // ... rest of config
});
```

4. **Deploy**
```bash
npm run deploy
```

---

### Option 4: Cloudflare Pages

**Steps:**

1. **Push to GitHub** (same as Vercel step 1)

2. **Deploy to Cloudflare**
- Go to [pages.cloudflare.com](https://pages.cloudflare.com)
- Connect GitHub repo
- Build settings:
  - Build command: `npm run build`
  - Build output directory: `dist`
- Deploy!

---

## 🔧 Build Configuration

### Environment Variables

If you need to store the API key server-side (not recommended for this app since it's client-only):

**`.env` file:**
```
VITE_GEMINI_API_KEY=your_key_here
```

**Access in code:**
```javascript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Note**: For this hackathon submission, user-provided API keys are better for demo purposes.

---

## 📦 Production Build

### Local Build Test

```bash
# Build
npm run build

# Preview locally
npm run preview
```

### Build Output
- Output directory: `dist/`
- Contains: HTML, CSS, JS, assets
- Optimized and minified
- Ready for any static host

---

## 🌐 Custom Domain (Optional)

### For Vercel:
1. Go to project settings
2. Add custom domain
3. Update DNS records as instructed

### For Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Update DNS

---

## 🐛 Troubleshooting

### Issue: "Module not found" after deployment
**Solution**: Ensure all imports use correct case (React is case-sensitive)

### Issue: API calls failing in production
**Solution**: Check CORS settings and API key validity

### Issue: Routes not working (404)
**Solution**: Configure redirects for SPA

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Netlify** - Create `public/_redirects`:
```
/*    /index.html   200
```

### Issue: Build fails with "out of memory"
**Solution**: Increase Node memory
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## 📊 Post-Deployment Checklist

- [ ] Test on mobile devices
- [ ] Test API key entry flow
- [ ] Upload sample wardrobe items
- [ ] Generate test outfits
- [ ] Verify conversational refinement
- [ ] Test image generation
- [ ] Check console for errors
- [ ] Verify localStorage persistence
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Update README with live demo link
- [ ] Update Devpost submission with URL

---

## 🎥 Demo Video Recording Setup

### Recommended Setup
- **Screen Recorder**: OBS Studio (free) or Loom
- **Resolution**: 1920x1080 (1080p)
- **Duration**: Under 3 minutes
- **Audio**: Clear microphone, no background noise

### Video Structure
1. Problem intro (30 sec)
2. Solution overview (30 sec)
3. Feature walkthrough (90 sec)
4. Impact/conclusion (30 sec)

### Upload Destinations
- YouTube (unlisted or public)
- Vimeo
- Direct Devpost upload

---

## 🔐 Security Best Practices

### For Production Use (Beyond Hackathon):

1. **Never commit API keys**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Implement rate limiting**
   - Prevent API abuse
   - Add request throttling

3. **Add backend proxy**
   - Hide API keys from client
   - Use serverless functions (Vercel/Netlify)

4. **User authentication**
   - Implement login system
   - Secure user data

---

## 📱 Mobile Optimization

The app is responsive, but for best mobile experience:

1. **Test on devices**
   - iPhone (Safari)
   - Android (Chrome)
   - iPad/tablets

2. **PWA Setup** (Future)
   - Add manifest.json
   - Service worker for offline
   - Add to home screen

---

## 🎯 Performance Optimization

### Current Optimizations:
- ✅ Vite code splitting
- ✅ Image lazy loading (via browser)
- ✅ LocalStorage caching
- ✅ Minimal dependencies

### Future Improvements:
- Image compression before upload
- CDN for static assets
- Service worker caching
- Bundle size analysis

---

## 📈 Analytics (Optional)

Add Google Analytics or Plausible:

**Google Analytics:**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

**Plausible (Privacy-friendly):**
```html
<script defer data-domain="nothinkfashion.vercel.app" src="https://plausible.io/js/script.js"></script>
```

---

## 🆘 Support

If you encounter deployment issues:
1. Check hosting platform documentation
2. Review build logs
3. Test locally first (`npm run build && npm run preview`)
4. Clear browser cache
5. Check API quotas

---

## ✅ Ready to Deploy!

**Recommended flow:**
1. Test locally
2. Push to GitHub
3. Deploy to Vercel
4. Get live URL
5. Test deployment
6. Record demo video
7. Update Devpost with URL
8. Submit!

Good luck! 🚀
