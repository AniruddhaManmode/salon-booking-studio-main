# Netlify Deployment Guide

## Quick Deploy (Recommended)

1. **Drag & Drop Method:**
   - Open [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag your `dist` folder onto the deploy area
   - Your site will be live instantly!

## Alternative: Git Integration

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial salon website"
   git branch -M main
   git remote add origin https://github.com/yourusername/salon-website.git
   git push -u origin main
   ```

2. **Connect Netlify:**
   - In Netlify dashboard → "Add new site" → "Import an existing project"
   - Connect GitHub
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

## Important URLs After Deployment

**Your Website:** `https://your-site-name.netlify.app`
**Owner Dashboard:** `https://your-site-name.netlify.app/admin`

## Firebase Configuration for Production

Since your Firebase config is already set for production, it will work automatically on Netlify!

## Custom Domain (Optional)

1. In Netlify dashboard → Site settings → Domain management
2. Add your custom domain (e.g., `assalon.com`)
3. Update DNS settings as instructed by Netlify

## Environment Variables (If Needed)

For production, you can add environment variables in Netlify:
- Site settings → Build & deploy → Environment
- Add any sensitive config if needed

## Test Everything

After deployment:
1. Test booking form
2. Check admin dashboard at `/admin`
3. Verify Firebase integration
4. Test on mobile devices

## Performance Tips

- Images are already optimized
- Consider lazy loading for more images
- Monitor Netlify analytics for performance

Your salon website will be live and ready to show clients!
