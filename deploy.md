1
Add a Web App Manifest
Create a file called manifest.json in your project root. Add these fields: name (Paper Cost), short_name (PaperCost), start_url (/), display (standalone — this removes the browser chrome so it feels like a native app), background_color, theme_color, and an icons array with at least a 192×192 and 512×512 PNG icon. Then link it in your index.html <head>: <link rel="manifest" href="/manifest.json">.
2
Add a Service Worker
Create sw.js in your project root. In it, listen for the install event and cache all your app's core files (index.html, your JS bundle, CSS, icons) using the Cache API. On the fetch event, return cached responses when the network is unavailable. This is what makes it work offline. Register the service worker in your main index.js or App.js: if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js') }.
3
Switch localStorage to IndexedDB (or keep localStorage)
Your current prototype uses localStorage which works fine in a PWA. If you're keeping the prototype as-is, no change needed — localStorage persists across sessions in Chrome on Android. Only migrate to IndexedDB later if data size becomes a concern (localStorage limit is ~5MB).
4
Host it somewhere Chrome can reach
PWAs require HTTPS to install. Easiest free options: Netlify (drag and drop your build folder at netlify.com/drop), Vercel (run npx vercel in your project folder), or GitHub Pages. All three give you a free HTTPS URL in under 2 minutes. If you're using plain HTML/JS, just drag the folder to Netlify Drop — done.
5
Open on the phone and install
On your dad's Android phone, open Chrome and go to the URL you just deployed. Chrome will automatically show an 'Add to Home Screen' banner at the bottom, or he can tap the three-dot menu → 'Add to Home Screen'. This installs it like an app — it gets its own icon on the home screen, opens full screen with no browser bar, and works offline after the first load.
6
Test offline
After installing, turn on airplane mode and open the app from the home screen icon. Everything should load and work. The only thing that won't work offline is if you add AI/API features later — but for the current calculator, it's fully offline once cached.
Why PWA over React Native right now:

Zero build environment setup
No APK signing, no Play Store
Your existing prototype works as-is with just manifest + service worker added
Can still migrate to React Native later using the same plan we wrote — PWA is just the testing vehicle
