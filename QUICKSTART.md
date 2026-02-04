# NoThinkFashion - Quick Start Guide

Get NoThinkFashion running on your local machine in **5 minutes**!

---

## ⚡ Super Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Go to http://localhost:3000

# 4. Enter your Gemini API key when prompted
# Get one free at: https://aistudio.google.com/apikey
```

**Done!** 🎉

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** installed ([Download here](https://nodejs.org/))
- ✅ **npm** or **yarn** (comes with Node.js)
- ✅ **Gemini API Key** ([Get free key](https://aistudio.google.com/apikey))
- ✅ **Modern browser** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Step-by-Step Setup

### Step 1: Clone or Download

**Option A: Clone with Git**
```bash
git clone https://github.com/yourusername/nothinkfashion.git
cd nothinkfashion
```

**Option B: Download ZIP**
- Download this repository as ZIP
- Extract to a folder
- Open terminal in that folder

---

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React 18
- Vite (build tool)
- Lucide React (icons)
- All dev dependencies

**Expected time**: 30-60 seconds

---

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

### Step 4: Open in Browser

1. Open **http://localhost:3000**
2. You'll see the API key entry screen
3. Enter your Gemini API key
4. Click "Get Started"

**🎉 You're in!**

---

## 🔑 Getting Your Gemini API Key

### Free API Key (For Testing/Hackathon)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Paste into NoThinkFashion

**Free Tier Limits:**
- 60 requests per minute
- Perfect for hackathon demos!

### Important Notes:
- ⚠️ Keep your API key private
- ⚠️ Don't commit it to GitHub
- ⚠️ For demo purposes, user-entered keys are fine

---

## 📱 Using the App

### Upload Wardrobe Items

1. Click **"Upload"** tab
2. Click **"Choose Files"**
3. Select 3+ clothing photos
4. Wait for AI analysis (5-10 seconds per item)
5. Items appear in wardrobe grid

**Photo Tips:**
- Use clear, well-lit photos
- One item per photo works best
- JPG or PNG format
- Any resolution (app handles resizing)

---

### Generate Outfits

1. Click **"Wardrobe"** tab
2. Scroll down to "Generate Outfits"
3. Select occasion (casual, business, formal, etc.)
4. Optionally enter location for weather
5. Click **"Generate Outfits with AI"**
6. Wait 10-20 seconds
7. View 3 outfit combinations with ratings

---

### Refine with Chat

1. Click **"Outfits"** tab
2. Scroll to "Refine Your Outfits"
3. Type natural requests:
   - "Make it more colorful"
   - "I don't like yellow"
   - "Show me more formal options"
4. AI adjusts suggestions

---

### Visualize Missing Pieces

1. In any outfit card, find "Missing Piece" section
2. Click **"Visualize"** button
3. Wait 10-15 seconds
4. See AI-generated product image (2K quality)

---

## 🛠️ Development Commands

### Run Development Server
```bash
npm run dev
```
- Starts Vite dev server
- Hot reload enabled
- Opens at http://localhost:3000

### Build for Production
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Minified and ready to deploy

### Preview Production Build
```bash
npm run preview
```
- Test production build locally
- Runs on http://localhost:4173

### Lint Code
```bash
npm run lint
```
- Check for code issues
- ESLint configuration included

---

## 📁 Project Structure

```
nothinkfashion/
├── src/
│   ├── NoThinkFashion.jsx    # Main app component
│   ├── App.jsx                # App wrapper
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets (if any)
├── index.html                 # HTML template
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
├── README.md                  # Documentation
├── DEPLOYMENT.md              # Deploy guide
├── DEVPOST_SUBMISSION.md     # Submission details
└── DEMO_VIDEO_SCRIPT.md      # Video script
```

---

## 🐛 Troubleshooting

### Issue: "Command not found: npm"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: Port 3000 already in use
**Solution**: 
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### Issue: API calls failing
**Check:**
- ✅ Is your API key correct?
- ✅ Are you online?
- ✅ Have you exceeded rate limits? (60/min for free tier)

### Issue: Images not uploading
**Check:**
- ✅ File size < 20MB
- ✅ File format is JPG/PNG/WEBP
- ✅ Browser supports FileReader API

### Issue: White screen after build
**Solution**: Check browser console for errors
```bash
# Test production build
npm run build
npm run preview
```

### Issue: Hot reload not working
**Solution**: 
```bash
# Restart dev server
# Stop with Ctrl+C
npm run dev
```

---

## 💡 Pro Tips

### For Best Demo Experience:

1. **Prepare Sample Photos**
   - Have 5-6 clothing photos ready before demo
   - Use varied items (shirt, pants, dress, jacket, shoes)
   - Clear backgrounds work best

2. **Test Internet Connection**
   - API calls require stable internet
   - 3-5 Mbps minimum recommended

3. **Use Incognito Mode for Demo**
   - Clean slate, no cached data
   - Professional look

4. **Enable Developer Tools**
   - Press F12 to see API calls
   - Shows thinking process in console

### For Hackathon Judges:

1. **Show API Key Entry** - Demonstrates security awareness
2. **Upload Varied Items** - Shows analysis versatility
3. **Generate Multiple Outfits** - Demonstrates AI reasoning
4. **Use Conversational Refinement** - Highlights thought signatures
5. **Generate Missing Piece** - Showcases image generation

---

## 📊 Performance Notes

**Expected Times:**
- App startup: < 2 seconds
- Single item analysis: 3-5 seconds
- Outfit generation: 10-20 seconds
- Image generation: 10-15 seconds
- Conversational response: 2-5 seconds

**Note**: Times vary based on:
- Internet speed
- API server load
- Image file sizes

---

## 🎨 Customization

### Change Colors

Edit gradient in `src/NoThinkFashion.jsx`:

```javascript
// Find this line:
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Change to your colors:
background: 'linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)'
```

### Change Fonts

Edit `src/index.css`:

```css
/* Replace Space Grotesk with your font */
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;600;700&display=swap');
```

### Modify Occasions

Edit occasion dropdown in `src/NoThinkFashion.jsx`:

```javascript
<option value="your-occasion">Your Occasion</option>
```

---

## 🚢 Ready to Deploy?

See **DEPLOYMENT.md** for detailed deployment instructions to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Cloudflare Pages

**Quick Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

---

## 📚 Additional Resources

- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **React Documentation**: https://react.dev
- **Vite Guide**: https://vitejs.dev
- **Lucide Icons**: https://lucide.dev

---

## 🆘 Need Help?

**Common Questions:**

**Q: Can I use this commercially?**
A: This is a hackathon project. For production use, implement proper backend, authentication, and API key management.

**Q: How much does the API cost?**
A: Free tier: 60 requests/min. Paid tier: $2-4 per 1M tokens. See https://ai.google.dev/pricing

**Q: Can I add more features?**
A: Absolutely! Fork the repo and build on it. Ideas in README.md

**Q: Is my wardrobe data private?**
A: Yes, stored only in your browser's localStorage. Never sent to any server except Gemini API.

---

## ✅ Final Checklist

Before demo/submission:
- [ ] API key works
- [ ] Uploaded 5+ wardrobe items
- [ ] Generated outfits successfully
- [ ] Tested conversational refinement
- [ ] Generated missing piece image
- [ ] All features working
- [ ] Tested in Chrome/Firefox
- [ ] Tested on mobile (optional)

---

**You're all set! Happy hacking! 🚀**

Questions? Issues? Check the troubleshooting section or review the full README.md.
