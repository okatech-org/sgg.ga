import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Start frontend monitoring & analytics in production
// NOTE: PWA/Service Workers intentionally removed (NEXUS-OMEGA directive)
// Government data must NOT be cached in browser service workers
if (import.meta.env.PROD) {
    import('./services/monitoring').then(({ monitoring }) => monitoring.start());
    import('./services/analytics').then(({ analytics }) => analytics.init());
    import('./services/performanceMonitoring').then(({ initPerformanceMonitoring }) => initPerformanceMonitoring());

    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
                registration.unregister();
            }
        });
    }
}

createRoot(document.getElementById("root")!).render(<App />);
