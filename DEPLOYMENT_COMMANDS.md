# 🚀 AG SUDOKU - QUICK DEPLOYMENT COMMANDS

## 📍 STEP 1: GIT SETUP

```bash
# Navigate to project
cd C:/Users/goiko/Projects/Sudoku

# Initialize Git
git init

# Add .gitignore (download from Claude first!)

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit - AG Sudoku v1.0"
```

---

## 🌐 STEP 2: GITHUB

```bash
# Add GitHub remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/ag-sudoku.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Manual steps:**
1. Go to: https://github.com/new
2. Create repo: `ag-sudoku`
3. Description: "AI-powered multilingual Sudoku game"
4. Public or Private
5. DON'T initialize with README
6. Click "Create repository"

---

## ☁️ STEP 3: VERCEL

**Manual steps (no commands needed):**
1. https://vercel.com → Sign up/Log in
2. "Add New..." → "Project"
3. Import `ag-sudoku`
4. Framework: Next.js (auto-detected)
5. Click "Deploy"
6. Wait 3-5 minutes
7. Get URL: `https://ag-sudoku-xxxxx.vercel.app`

---

## 🌐 STEP 4: CUSTOM DOMAIN

**In Vercel:**
1. Project → Settings → Domains
2. Add: `sudoku.alexgoiko.com`

**In DNS Provider:**
- Type: CNAME
- Name: `sudoku`
- Value: `cname.vercel-dns.com`
- TTL: 3600

**Wait:** 15-30 minutes for propagation

---

## 🧪 STEP 5: TEST

Visit: https://sudoku.alexgoiko.com

Test checklist:
✅ Welcome screen loads
✅ All languages work
✅ Can start game
✅ Full 9×9 grid visible
✅ Can place numbers
✅ Notes mode works
✅ Hints work
✅ Timer runs
✅ Auto-save works
✅ Mobile responsive

---

## 🔄 FUTURE UPDATES

```bash
# Make code changes, save files

# Stage changes
git add .

# Commit
git commit -m "Describe your changes here"

# Push (triggers auto-deploy)
git push

# Vercel rebuilds automatically in ~60 seconds!
```

---

## 🆘 TROUBLESHOOTING

**Build fails?**
```bash
# Test build locally first
npm run build

# Fix any errors, then push again
git add .
git commit -m "Fix build errors"
git push
```

**Domain not working?**
- Wait 15-30 mins
- Check DNS: `nslookup sudoku.alexgoiko.com`
- Verify CNAME in domain provider

**Game not loading?**
- Check browser console (F12)
- Clear cache (Ctrl+Shift+Delete)
- Try incognito mode

---

## 📊 USEFUL COMMANDS

```bash
# Check Git status
git status

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# View remote URLs
git remote -v
```

---

**Quick Start Time:** ~30 minutes  
**Total Time (with domain):** ~1 hour  

🎮 **LET'S DEPLOY!**
