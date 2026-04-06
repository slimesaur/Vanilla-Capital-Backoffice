# MacBook Air M1 - Memory & Performance Checkup Report
**Date:** March 18, 2026

---

## 🔴 Critical finding: 8 GB RAM is your main bottleneck

Your MacBook Air M1 has **8 GB of unified memory**. For modern development (Cursor + Node.js + browsers), this is tight. The system is under significant memory pressure.

---

## 📊 What Apple "Hides" – The Real Memory Picture

### Apple's misleading number
- **"System-wide memory free: 37%"** – This includes compressed and inactive memory. It's not what you can actually use.

### The truth (from `vm_stat`):
| Metric | Value | What it means |
|--------|-------|---------------|
| **Pages free** | ~3,600 | **~60 MB** of truly free RAM – critically low |
| **Pages in compressor** | 622,864 | ~**10 GB** of data compressed to fit in 8 GB |
| **Compressions** | 4.5 billion | macOS constantly compressing to make room |
| **Swapouts** | 170 million | Heavy swapping to disk = **slow** |
| **Swapins** | 158 million | Reading from disk = **lag** |
| **Pageouts** | 5.3 million | More disk writes = wear + slowdown |

**Bottom line:** Your Mac is effectively out of RAM. It’s compressing memory and swapping to disk all the time, which causes lag.

---

## 📈 Top memory consumers (current)

1. **Cursor (total ~1.2 GB)**
   - Renderer process: ~405 MB
   - Extension hosts: ~192 MB, ~113 MB, ~68 MB
   - GPU process: ~76 MB
   - Main process: ~134 MB
   - Text input service: ~181 MB

2. **WindowServer** – ~137 MB (system graphics)

3. **Various system services** – WiFi, security, accounts, etc.

---

## 💾 Caches – 15+ GB you can free

| Location | Size | Notes |
|----------|------|-------|
| **Arc browser** | 5.0 GB | Safe to clear |
| **Google (Chrome)** | 4.6 GB | Safe to clear |
| **npm cache** | 1.0 GB | Safe; rebuilds on next install |
| **Cursor app data** | 1.8 GB | Can trim CachedData |
| **ms-playwright** | 520 MB | Test runner cache |
| **Siri TTS** | 483 MB | Voice cache |
| **Steam** | 274 MB | Game cache |
| **Homebrew** | 169 MB | Package cache |
| **node-gyp** | 128 MB | Native module build cache |
| **Epic Games** | 116 MB | Game launcher cache |

**Total reclaimable:** ~15+ GB on disk (more free RAM after clearing and reducing disk pressure)

---

## 🚀 Startup items (run at login)

These add work at every boot and while you’re using the Mac:

- **Epic Games Launcher**
- **Google Keystone** (2 agents) – Chrome/Drive updater
- **Google Updater**
- **Steam**
- **Microsoft OneDrive** (3 agents) – Sync, updater, reporter

---

## ✅ Performance improvement plan

### Phase 1: Immediate (today) – ~30 min

#### 1. Clear large caches
```bash
# Arc browser (5 GB) – Close Arc first
rm -rf ~/Library/Caches/Arc

# Google/Chrome (4.6 GB) – Close Chrome first
rm -rf ~/Library/Caches/Google

# npm cache (1 GB) – rebuilds automatically
npm cache clean --force

# Playwright (520 MB) – if you don't need test caches
rm -rf ~/Library/Caches/ms-playwright
```

#### 2. Trim Cursor cache
- Close Cursor
- Delete: `~/Library/Application Support/Cursor/CachedData` (~269 MB)
- Reopen Cursor (it will rebuild indexes)

#### 3. Reduce Cursor memory
- **Settings → search "memory"**
- Lower **"Renderer: Memory Limit"** (e.g. 2048 → 1024 or 512) if available
- Disable extensions you don’t need
- Close unused editor tabs and workspaces

---

### Phase 2: Short term (this week)

#### 4. Clean up startup items
```bash
# Disable Epic Games at login (keep app, just don't launch)
launchctl unload -w ~/Library/LaunchAgents/com.epicgames.launcher.plist

# Disable Steam at login
launchctl unload -w ~/Library/LaunchAgents/com.valvesoftware.steamclean.plist

# Google Keystone – consider disabling if you don't need auto-update
# launchctl unload -w ~/Library/LaunchAgents/com.google.keystone.agent.plist
# launchctl unload -w ~/Library/LaunchAgents/com.google.keystone.xpcservice.plist
```

#### 5. Use Activity Monitor
- Open **Activity Monitor**
- Sort by **Memory**
- Quit or force-quit anything large you don’t need (browsers, Slack, etc.)

#### 6. Browser discipline
- Use **one** primary browser
- Limit tabs (e.g. 5–10)
- Use tab suspension extensions or bookmark-heavy pages
- Avoid having Arc + Chrome open at once

---

### Phase 3: Habits and settings

#### 7. Dev workflow
- Run `npm run dev` only when needed; stop it when idle
- Close Cursor when not coding
- Prefer Safari for casual browsing (often lighter than Chrome/Arc)

#### 8. Swap reduction
- Keep fewer apps in the background
- Quit apps instead of minimizing when possible
- Restart the Mac every few days to clear memory fragmentation

#### 9. Optional: Disable OneDrive at login
If you don’t need sync at startup:
```bash
launchctl unload -w /Library/LaunchAgents/com.microsoft.OneDriveStandaloneUpdater.plist
launchctl unload -w /Library/LaunchAgents/com.microsoft.SyncReporter.plist
launchctl unload -w /Library/LaunchAgents/com.microsoft.update.agent.plist
```
(Requires admin/sudo for `/Library/`.)

---

### Phase 4: Hardware (if budget allows)

**Strong recommendation:** Upgrade to **16 GB RAM** for your next Mac.

8 GB is workable but tight for:
- Cursor + extensions
- Node.js dev server
- Browser with many tabs
- System services

16 GB would remove most swap pressure and reduce lag.

---

## 📋 Quick reference commands

```bash
# Check current memory
vm_stat

# See memory pressure
memory_pressure

# Clear npm cache
npm cache clean --force

# Find largest folders in Caches
du -sh ~/Library/Caches/* | sort -hr | head -20
```

---

## Summary

| Issue | Impact | Fix |
|-------|--------|-----|
| 8 GB RAM | High | Workflow changes + possible future upgrade |
| ~60 MB free RAM | High | Quit unused apps, limit Cursor/browser |
| Heavy swap | High | Same as above |
| 12 GB caches | Medium | Clear Arc, Chrome, npm |
| 6+ startup items | Medium | Disable Epic, Steam, consider others |
| Cursor memory | Medium | Lower limit, close tabs, disable extensions |

The largest gains will come from: clearing caches, limiting what runs at once, and, longer term, moving to 16 GB RAM if you upgrade your machine.
