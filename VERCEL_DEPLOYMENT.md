# Deploying Weights and Stuff to Vercel

This guide walks you through deploying your Weights and Stuff habit tracker to Vercel for free.

## Prerequisites

- A GitHub account (free at https://github.com)
- A Vercel account (free at https://vercel.com)

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `weights-and-stuff` (or any name you prefer)
3. **Do NOT initialize with README** (we'll push existing code)
4. Click "Create repository"

## Step 2: Push Your Code to GitHub

Run these commands in your terminal:

```bash
cd /home/ubuntu/habit-tracker

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/weights-and-stuff.git

# Rename branch to main if needed
git branch -M main

# Push code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Connect Vercel to Your GitHub Repository

1. Go to https://vercel.com
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Paste your repository URL: `https://github.com/YOUR_USERNAME/weights-and-stuff`
5. Click **"Import"**

## Step 4: Configure Vercel Settings

When Vercel asks for configuration:

### Build Settings
- **Framework Preset:** Select "Other"
- **Build Command:** `pnpm build && npx expo export --platform web`
- **Output Directory:** `.expo/web`
- **Install Command:** `pnpm install`

### Environment Variables
No environment variables needed for the free tier (data is stored locally in the browser).

## Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Once done, you'll get a URL like: `https://weights-and-stuff.vercel.app`

## Step 6: Custom Domain (Optional)

To use your own domain:

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Enter your domain name
4. Follow the DNS instructions provided

## Automatic Deployments

Every time you push code to GitHub, Vercel automatically:
- Builds your app
- Runs tests
- Deploys the new version

No manual steps needed!

## Troubleshooting

### Build fails with "expo not found"
- Make sure `package.json` has expo in dependencies
- Vercel should auto-detect this

### Data not persisting
- This is normal! Browser storage (AsyncStorage) is cleared between sessions
- To persist data across sessions, you'd need a backend database (optional upgrade)

### Need to update the app?
1. Make changes locally
2. Commit: `git commit -am "Your message"`
3. Push: `git push`
4. Vercel automatically deploys!

## Support

- Vercel Docs: https://vercel.com/docs
- Expo Web Docs: https://docs.expo.dev/guides/web/

---

**Your app will be live at:** `https://weights-and-stuff.vercel.app`

Enjoy your deployed habit tracker! 🎉
