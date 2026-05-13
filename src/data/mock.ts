export const products = [
  { id: "1", name: "Phantom Loader", price: 29.99, category: "Loaders", status: "Online", rating: 4.9, features: ["HWID Lock", "Auto Updates", "24/7 Support"], color: "from-emerald-400 to-teal-500" },
  { id: "2", name: "Spectral Spoofer", price: 49.99, category: "Spoofers", status: "Online", rating: 4.8, features: ["Permanent Spoof", "Cleaner Included", "Stealth Mode"], color: "from-teal-400 to-cyan-500" },
  { id: "3", name: "Aurora Cheat", price: 19.99, category: "Tools", status: "Updating", rating: 4.7, features: ["Aimbot", "ESP", "Misc"], color: "from-emerald-300 to-green-500" },
  { id: "4", name: "Nova Bypass", price: 39.99, category: "Tools", status: "Online", rating: 4.9, features: ["Anti-Cheat Bypass", "Daily Updates"], color: "from-cyan-400 to-emerald-500" },
  { id: "5", name: "Eclipse Suite", price: 89.99, category: "Bundles", status: "Online", rating: 5.0, features: ["All Tools", "Priority Support", "Lifetime"], color: "from-green-400 to-teal-600" },
  { id: "6", name: "Vortex Toolkit", price: 24.99, category: "Tools", status: "Online", rating: 4.6, features: ["Custom Configs", "Cloud Sync"], color: "from-emerald-500 to-cyan-600" },
  { id: "7", name: "Quantum Cleaner", price: 14.99, category: "Utilities", status: "Online", rating: 4.5, features: ["Deep Clean", "Trace Removal"], color: "from-teal-300 to-emerald-500" },
  { id: "8", name: "Halo License Mgr", price: 0, category: "Free", status: "Online", rating: 4.4, features: ["Open Source", "Self Hosted"], color: "from-emerald-400 to-green-500" },
];

export const reviews = [
  { id: "1", name: "Alex K.", avatar: "AK", rating: 5, text: "Cleanest interface I've seen for software licensing. Insanely fast delivery.", product: "Phantom Loader", date: "2 days ago" },
  { id: "2", name: "Mira S.", avatar: "MS", rating: 5, text: "Got my license in seconds. HWID reset worked flawlessly.", product: "Spectral Spoofer", date: "1 week ago" },
  { id: "3", name: "Diego R.", avatar: "DR", rating: 4, text: "Solid product, support replied within minutes on Discord.", product: "Eclipse Suite", date: "3 days ago" },
  { id: "4", name: "Yuki T.", avatar: "YT", rating: 5, text: "Premium feel through and through. Worth every cent.", product: "Nova Bypass", date: "5 days ago" },
  { id: "5", name: "Sam P.", avatar: "SP", rating: 5, text: "Reseller panel is gorgeous. Generated 200+ keys without issues.", product: "Reseller", date: "2 weeks ago" },
  { id: "6", name: "Nina O.", avatar: "NO", rating: 4, text: "Status page actually works in real-time. Refreshing.", product: "Aurora Cheat", date: "yesterday" },
];

export const services = [
  { name: "Authentication Server", status: "operational", uptime: 99.99 },
  { name: "API Gateway", status: "operational", uptime: 99.97 },
  { name: "Website", status: "operational", uptime: 100 },
  { name: "Download CDN", status: "degraded", uptime: 98.42 },
  { name: "Database Cluster", status: "operational", uptime: 99.95 },
  { name: "License Engine", status: "operational", uptime: 99.99 },
];

export const incidents = [
  { date: "May 5, 2026", title: "Brief CDN latency in EU region", status: "Resolved", duration: "12 min" },
  { date: "Apr 28, 2026", title: "Scheduled database maintenance", status: "Completed", duration: "45 min" },
  { date: "Apr 14, 2026", title: "Auth server elevated response times", status: "Resolved", duration: "8 min" },
];
