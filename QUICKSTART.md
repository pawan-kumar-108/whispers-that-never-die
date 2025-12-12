# 🚀 Quick Start Guide - Patchwork

## Get Started in 3 Steps!

### 1️⃣ Get Your API Key
Get a **FREE** Cohere API key from: https://dashboard.cohere.com/api-keys

### 2️⃣ Add Your API Key
Open the `.env` file and replace the placeholder with your actual key:
```bash
COHERE_API_KEY=your-actual-api-key-here
```

### 3️⃣ Run the App
```bash
cd dreamware
./run.sh
```

**That's it!** The app will be running at http://localhost:5000 🎉

---

## Alternative: Manual Start

If the `run.sh` script doesn't work, run these commands:

```bash
cd dreamware

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Run the app
python backend/app.py
```

---

## ✅ What's Already Set Up

- ✅ Virtual environment (`venv/`)
- ✅ All Python dependencies installed
- ✅ Database ready
- ✅ WebSocket configured
- ✅ Updated Cohere API (fixed deprecated code)
- ✅ Environment validation added

---

## ⚠️ Important Notes

1. **Without API Key**: The app will run, but AI affirmations won't work
2. **Port 5000**: Make sure port 5000 is available
3. **Internet Required**: For AI features and WebSocket connections

---

## 🆘 Need Help?

Check the detailed guide: `SETUP_AND_IMPROVEMENTS.md`

### Common Issues:

**"Permission denied: ./run.sh"**
```bash
chmod +x run.sh
```

**"Port 5000 already in use"**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

**"Module not found"**
```bash
source venv/bin/activate
pip install -r backend/requirements.txt
```

---

## 🎨 What You Can Do

Once running, you can:
- 🎨 Pick a color that reflects your emotion
- ✍️ Write how you're feeling
- 🤖 Get an AI-generated poetic affirmation
- 🌐 See everyone's patches in real-time
- 🎵 Toggle ambient music

---

## 📚 Next Steps

After getting it running, check out:
- `SETUP_AND_IMPROVEMENTS.md` for detailed improvements to add
- `README.md` for project overview and future features

---

**Happy quilting! 🌸**
