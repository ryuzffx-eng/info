export const isServer = typeof window === "undefined";
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || 
     window.location.hostname.startsWith("192.168.") || 
     window.location.hostname.includes("127.0.0.1") ||
     window.location.hostname.endsWith(".nip.io"))
    ? `http://${window.location.hostname}:3005/api/v1` 
    : "https://spacex.emerite.store/api/v1");

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = !isServer ? localStorage.getItem("access_token") : null;
  
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[apiFetch] Calling: ${url}`);
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && !isServer && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("access_token");
      if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/reseller")) {
        window.location.href = "/login";
      }
    }
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: any) => {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      return fetch(`${API_BASE_URL}/login/access-token`, {
        method: "POST",
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error("Invalid credentials");
        return res.json();
      });
    },
    register: (data: any) => apiFetch("/register", { method: "POST", body: JSON.stringify(data) }),
    googleLogin: (token: string) => apiFetch("/login/google", { method: "POST", body: JSON.stringify({ token }) }),
    me: () => apiFetch("/me"),
    myLicenses: () => apiFetch("/my-licenses"),
  },
  marketplace: {
    getProducts: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return apiFetch(`/store/products?${query}`);
    },
    getCategories: () => apiFetch("/store/categories"),
    getPublicStats: () => apiFetch("/store/stats"),
    createProduct: (data: any) => apiFetch("/store/products", { method: "POST", body: JSON.stringify(data) }),
    createCategory: (data: any) => apiFetch("/store/categories", { method: "POST", body: JSON.stringify(data) }),
    getReviews: (productId?: number) => apiFetch(`/store/reviews${productId ? `?product_id=${productId}` : ""}`),
    createReview: (data: any) => apiFetch("/store/reviews", { method: "POST", body: JSON.stringify(data) }),
    deleteProduct: (id: number) => apiFetch(`/store/products/${id}`, { method: "DELETE" }),
    updateProduct: (id: number, data: any) => apiFetch(`/store/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  admin: {
    getApplications: () => apiFetch("/admin/applications"),
    createApplication: (data: any) => apiFetch("/admin/applications", { method: "POST", body: JSON.stringify(data) }),
    getResellers: () => apiFetch("/admin/resellers"),
    createReseller: (data: any) => apiFetch("/admin/resellers", { method: "POST", body: JSON.stringify(data) }),
    updateReseller: (id: number, data: any) => apiFetch(`/admin/resellers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    getStats: () => apiFetch("/admin/stats"),
    getUsers: () => apiFetch("/admin/users"),
    getLicenses: (params?: { page?: number; limit?: number; search?: string; status?: string; app_id?: number }) => {
      const query = new URLSearchParams();
      if (params) {
        if (params.page !== undefined) query.append("page", params.page.toString());
        if (params.limit !== undefined) query.append("limit", params.limit.toString());
        if (params.search !== undefined) query.append("search", params.search);
        if (params.status !== undefined) query.append("status", params.status);
        if (params.app_id !== undefined) query.append("app_id", params.app_id.toString());
      }
      return apiFetch(`/admin/licenses?${query.toString()}`);
    },
    deleteLicense: (id: number) => apiFetch(`/admin/licenses/${id}`, { method: "DELETE" }),
    resetLicenseHwid: (id: number) => apiFetch(`/admin/licenses/${id}/reset-hwid`, { method: "PATCH" }),
    getLogs: () => apiFetch("/admin/logs"),
    getFiles: () => apiFetch("/admin/files"),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch("/files/upload", { 
        method: "POST", 
        body: formData
      });
    },
    replaceFile: (id: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch(`/files/${id}`, { 
        method: "PUT", 
        body: formData
      });
    },
    deleteFile: (id: number) => apiFetch(`/files/${id}`, { method: "DELETE" }),
    getStorePages: () => apiFetch("/admin/store-pages"),
    toggleMaintenance: (id: number) => apiFetch(`/admin/applications/${id}/toggle-maintenance`, { method: "PATCH" }),
    refreshSecret: (id: number) => apiFetch(`/admin/applications/${id}/refresh-secret`, { method: "PATCH" }),
    deleteApplication: (id: number) => apiFetch(`/admin/applications/${id}`, { method: "DELETE" }),
    addCredits: (id: number, amount: number) => apiFetch(`/admin/resellers/${id}/add-credits?amount=${amount}`, { method: "PATCH" }),
    getUserDetails: (id: number) => apiFetch(`/admin/users/${id}`),
    updateUser: (id: number, data: any) => apiFetch(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteUser: (id: number) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
    getSettings: () => apiFetch("/admin/settings"),
    updateSettings: (settings: Record<string, string>) => apiFetch("/admin/settings", { method: "POST", body: JSON.stringify({ settings }) }),
    getTelemetry: (params?: { page?: number; limit?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params) {
        if (params.page !== undefined) query.append("page", params.page.toString());
        if (params.limit !== undefined) query.append("limit", params.limit.toString());
        if (params.search !== undefined) query.append("search", params.search);
      }
      return apiFetch(`/admin/telemetry?${query.toString()}`);
    },
    deleteTelemetry: (id: number) => apiFetch(`/admin/telemetry/${id}`, { method: "DELETE" }),
  },
  reseller: {
    generateLicenses: (data: any) => apiFetch("/reseller/generate-licenses", { method: "POST", body: JSON.stringify(data) }),
    getMyLicenses: (params?: { page?: number; limit?: number; search?: string; status?: string; app_id?: number }) => {
      const query = new URLSearchParams();
      if (params) {
        if (params.page !== undefined) query.append("page", params.page.toString());
        if (params.limit !== undefined) query.append("limit", params.limit.toString());
        if (params.search !== undefined) query.append("search", params.search);
        if (params.status !== undefined) query.append("status", params.status);
        if (params.app_id !== undefined) query.append("app_id", params.app_id.toString());
      }
      return apiFetch(`/reseller/my-licenses?${query.toString()}`);
    },
    getProfile: () => apiFetch("/reseller/profile"),
    getApplications: () => apiFetch("/reseller/applications"),
    deleteLicense: (id: number) => apiFetch(`/reseller/licenses/${id}`, { method: "DELETE" }),
    resetLicenseHwid: (id: number) => apiFetch(`/reseller/licenses/${id}/reset-hwid`, { method: "PATCH" }),
    togglePauseLicense: (id: number) => apiFetch(`/reseller/licenses/${id}/toggle-pause`, { method: "PATCH" }),
  },
  bypass: {
    getStats: () => apiFetch("/bypass/stats"),
    getWhitelist: (region?: string) => apiFetch(`/bypass/whitelist${region ? `?region=${region}` : ""}`),
    addToWhitelist: (data: any) => apiFetch("/bypass/whitelist", { method: "POST", body: JSON.stringify(data) }),
    removeFromWhitelist: (uid: string) => apiFetch(`/bypass/whitelist/${uid}`, { method: "DELETE" }),
    extendWhitelist: (uid: string, duration: string) => apiFetch(`/bypass/whitelist/${uid}/extend`, { method: "PATCH", body: JSON.stringify({ duration }) }),
    purgeExpired: () => apiFetch("/bypass/whitelist/purge", { method: "POST" }),
    getBlacklist: () => apiFetch("/bypass/blacklist"),
    addToBlacklist: (data: any) => apiFetch("/bypass/blacklist", { method: "POST", body: JSON.stringify(data) }),
    removeFromBlacklist: (uid: string) => apiFetch(`/bypass/blacklist/${uid}`, { method: "DELETE" }),
    checkUid: (uid: string) => apiFetch(`/bypass/check/${uid}`),
    getLogs: (uid?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (uid) params.append("uid", uid);
      if (limit) params.append("limit", limit.toString());
      return apiFetch(`/bypass/logs?${params.toString()}`);
    }
  },
  theme: {
    getGlobal: () => apiFetch("/theme"),
    updateGlobal: (themeName: string) => apiFetch("/admin/theme", { method: "POST", body: JSON.stringify({ theme: themeName }) }),
  }
};

