import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Start frontend monitoring, analytics + PWA in production
if (import.meta.env.PROD) {
    import('./services/monitoring').then(({ monitoring }) => monitoring.start());
    import('./services/analytics').then(({ analytics }) => analytics.init());
    import('./services/performanceMonitoring').then(({ initPerformanceMonitoring }) => initPerformanceMonitoring());

    // Register Service Worker for offline support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // SW registration failed — app still works without it
            });
        });
    }
}

createRoot(document.getElementById("root")!).render(<App />);
