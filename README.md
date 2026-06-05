# DeepLink Demo PWA

A minimal installable PWA to test that a deep link opens your **installed app**
instead of the browser.

## Pages
- `index.html` — home, shows the deep-link URL and current display mode
- `profile.html` — the deep-link target; shows OK (green) if running inside the
  installed PWA, or WARN (orange) if it opened in a browser tab

## Run locally (must be HTTPS or localhost for install to work)
```
cd deeplink-pwa
python3 -m http.server 8080
```
Then open http://localhost:8080 on desktop to verify, but to install on a phone
you need HTTPS — deploy the folder to any static host (Netlify, Vercel,
GitHub Pages, Cloudflare Pages, Firebase Hosting).

## Deploy fastest (Netlify drop)
1. Zip is not needed — drag the `deeplink-pwa` folder onto https://app.netlify.com/drop
2. You get an https URL, e.g. https://your-site.netlify.app

## The deep link
```
https://YOUR_HOST/profile.html?id=42&utm=test
```

## How to test on mobile
1. Open `https://YOUR_HOST/` in Chrome (Android) or Safari (iOS).
2. Install: Android Chrome menu -> Install app. iOS Safari Share -> Add to Home Screen.
3. **Open the app once from the home-screen icon** (required so the OS registers it).
4. Now trigger the deep link from OUTSIDE the browser:
   - Put the URL in a Notes/Keep note and tap it, OR
   - Make a QR code of the URL and scan it, OR
   - Send it in a chat app and tap it.
5. The `profile.html` page should open and show **GREEN: OPENED INSIDE INSTALLED PWA**.

## Why "open in app, not website"
Once installed, the manifest `scope` ("/") tells the OS this origin belongs to the
installed app. On Android Chrome, links whose URL falls inside that scope are
captured and opened in the standalone app window (link capturing). The page
confirms this via `matchMedia('(display-mode: standalone)')`.

### Platform caveats
- **Android Chrome**: link capturing works well. Tapping an in-scope https link
  from another app opens the PWA. `launch_handler.client_mode` reuses the existing
  window.
- **iOS Safari**: more limited. iOS does NOT auto-capture arbitrary https links
  into a home-screen PWA. Tapping the link usually opens Safari. The page will
  still correctly report standalone=false there. To get true deep linking into the
  app on iOS you need either Universal Links (a native wrapper app + apple-app-
  site-association file) or open the installed icon and navigate. The standalone
  detection in profile.html lets you confirm the actual context on either OS.
# pwa-demo
