# Mac Cleanup Report – Safe to Delete
**Generated:** March 18, 2026

Based on macOS best practices and a full system scan. Items are categorized by safety level.

---

## ✅ VERY SAFE – Rebuilds automatically

| Item | Size | What it is | Notes |
|------|------|------------|-------|
| **~/Library/Caches/** (selective) | ~2.4 GB total | App caches | Apps rebuild as needed |
| **npm cache** | 1.0 GB | `~/.npm` | Run `npm cache clean --force` |
| **Homebrew cache** | 169 MB | Downloaded formula bottles | Run `brew cleanup` |
| **node-gyp cache** | 128 MB | Native module build cache | Rebuilds on `npm install` |
| **Log files** (old) | ~96 MB | ~/Library/Logs | Past logs; safe to delete |
| **Trash** | varies | ~/.Trash | Empty Trash to free space |

### Cache breakdown – safe to delete

| Cache | Size | Safe? |
|-------|------|-------|
| com.todesktop.230313mzl4w4u92.ShipIt | 768 MB | ✅ App updater cache |
| SiriTTS | 483 MB | ✅ Voice synthesis cache |
| Steam | 274 MB | ✅ Game cache |
| Homebrew | 169 MB | ✅ Use `brew cleanup` |
| node-gyp | 128 MB | ✅ Build cache |
| Epic Games Launcher | 116 MB | ✅ Game launcher cache |
| vscode-cpptools | 96 MB | ✅ C++ extension cache |
| Firefox | 82 MB | ✅ Browser cache |
| GeoServices | 68 MB | ✅ Map/location cache |
| typescript | 4.5 MB | ✅ TypeScript cache |

---

## ✅ SAFE – But understand what you lose

| Item | Size | What it is | Notes |
|------|------|-------|-------|
| **Xcode DerivedData** | ~320 MB | Build artifacts | Xcode will rebuild; speeds up dev |
| **Xcode CoreSimulator** | 192 MB | iOS Simulator data | Keep if you use iOS sim |
| **Docker data** | 1.9 GB | Images, containers, volumes | Only if you don't use Docker |
| **Old app logs** | 96 MB | OneDrive, Riot, Zoom, etc. | Diagnostic history |
| **HTTPStorages** | 81 MB | Session/cookie-like data | May log you out of some apps |

---

## ⚠️ CAUTIOUS – Delete only if you're sure

| Item | Size | Notes |
|------|------|-------|
| **Apple caches** (com.apple.*) | ~100 MB | Some can affect Spotlight, Help, etc. Best to leave alone. |
| **CleanMyMac logs** | 2.8 MB | Safe, but indicates CleanMyMac is installed |
| **DiagnosticReports** | 392 KB | Crash logs – useful for debugging |

---

## ❌ DO NOT DELETE

- `/Library/` (system) – only advanced users, and only specific cache contents
- `~/Library/Application Support/` – app data; most are needed
- `~/.nvm` – Node versions; required for development
- `/private/var/folders` – system temp files; macOS manages these

---

## Recommended cleanup commands

### 1. Quick wins (run these now)

```bash
# npm cache
npm cache clean --force

# Homebrew
brew cleanup

# Empty Trash
# (Do manually: Finder → Empty Trash)
```

### 2. Selective cache cleanup (~1.5 GB)

Close the relevant apps first, then:

```bash
# Unused app caches (apps you removed or rarely use)
rm -rf ~/Library/Caches/com.todesktop.230313mzl4w4u92.ShipIt  # 768 MB
rm -rf ~/Library/Caches/SiriTTS                               # 483 MB
rm -rf ~/Library/Caches/Steam                                 # 274 MB
rm -rf ~/Library/Caches/com.epicgames.EpicGamesLauncher       # 116 MB
rm -rf ~/Library/Caches/node-gyp                               # 128 MB
```

### 3. Log cleanup (~96 MB)

```bash
# Old logs (keep DiagnosticReports if you debug crashes)
rm -rf ~/Library/Logs/OneDrive
rm -rf ~/Library/Logs/Riot\ Games
rm -rf ~/Library/Logs/zoom.us
# etc.
```

### 4. Xcode (if you don't need old build cache)

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### 5. Docker (only if you don't use Docker)

```bash
# Docker stores ~1.9 GB – remove only if you don't use it
rm -rf ~/Library/Containers/com.docker.docker/Data
# Or use Docker Desktop: Settings → Resources → Clean / Purge data
```

---

## Best practices (summary)

1. Restart after big cache cleanups so macOS can rebuild.
2. Avoid deleting whole system folders; delete contents, not the parent folder.
3. Back up important data before major cleanups.
4. Run `brew cleanup` and `npm cache clean --force` periodically.
5. Empty Trash regularly.
6. If using Docker, prune images: `docker system prune -a` when safe.
7. Review ~/Downloads for old files.
8. Remove old iOS backups: `~/Library/Application Support/MobileSync/Backup/`.

---

## Estimated recoverable space

| Category | Size |
|----------|------|
| npm + Homebrew + node-gyp | ~1.3 GB |
| App caches (Steam, Epic, Siri, todesktop) | ~1.6 GB |
| Logs | ~96 MB |
| Xcode DerivedData | ~320 MB |
| **Total (conservative)** | **~3.3 GB** |

Docker: +1.9 GB if you don't use it.
