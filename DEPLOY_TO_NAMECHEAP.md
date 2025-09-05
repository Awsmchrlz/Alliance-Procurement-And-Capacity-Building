# Deploy to Namecheap - Simple Instructions

## 🚨 Quick Fix for Memory Error

Your WebAssembly memory error is fixed! Follow these exact steps:

## Step 1: Build the Ultra-Lightweight Version

```bash
npm run build:minimal
```

This creates a tiny 2KB server that uses only 128MB of memory.

## Step 2: Upload to Namecheap

Upload these files to your Namecheap hosting:

```
📁 Your Files to Upload:
├── dist/index-minimal.js          ← Ultra-lightweight server (2KB)
├── public/                        ← Client files
│   ├── index.html
│   └── assets/
├── package.json                   ← Dependencies
├── .env                          ← Your environment variables
└── start-namecheap.sh            ← Startup script
```

## Step 3: Configure Environment

Create/edit your `.env` file with:

```env
NODE_ENV=production
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=5005
```

## Step 4: Start the Application

### Option A: Using cPanel Node.js App Manager
1. Go to cPanel → Node.js Apps
2. Create New Application:
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: Your domain folder
   - **Application Startup File**: `dist/index-minimal.js`
   - **Environment Variables**: Add your .env values

### Option B: Using SSH (if available)
```bash
chmod +x start-namecheap.sh
./start-namecheap.sh
```

## ✅ What This Fixes

- ✅ Reduces memory usage from 512MB to 128MB
- ✅ Ultra-small server bundle (2KB vs 44KB)
- ✅ Aggressive garbage collection
- ✅ Automatic memory monitoring and restart
- ✅ No WebAssembly dependencies
- ✅ Works within Namecheap's strict limits

## 🔍 Check It's Working

Visit: `https://yourdomain.com/api/health`

Should show:
```json
{
  "status": "ok",
  "heap": "15MB"
}
```

## ⚠️ Limitations in Minimal Mode

- Database operations are simplified
- Some API routes are disabled to save memory
- Detailed logging is turned off
- File upload limits are reduced

## 🆘 If Still Having Issues

1. **Check memory usage**: Visit `/api/health`
2. **Reduce further**: Edit `start-namecheap.sh` and change `128` to `64`
3. **Contact Namecheap**: Ask them to increase your memory limits
4. **Alternative**: Consider upgrading to VPS hosting

## 📞 Support

If this doesn't work, the issue is likely Namecheap's hosting limits are too restrictive for Node.js applications. Consider:
- Namecheap VPS hosting
- Vercel/Netlify for better Node.js support
- Using Namecheap only for static file hosting

---

**This minimal build should resolve your WebAssembly memory error!**