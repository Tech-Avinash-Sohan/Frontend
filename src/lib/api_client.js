// One place for every call to the Django API (school_erp_backend).
//
// api.*        -> real request to the Django API with "Authorization: Bearer <access token>".
//                 A 401 refreshes the token once (/auth/token/refresh/) and retries; if that fails you are signed out.
//
// Every call (with its payload) is printed in the browser console while developing (npm run dev).

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
const LOG_API = import.meta.env.VITE_LOG_API ? import.meta.env.VITE_LOG_API === "true" : import.meta.env.DEV;
const SECRET_FIELDS = ["password", "new_password", "old_password", "refresh", "access"];
const TOKEN_KEY = "school_erp_tokens";
let onSignedOut = () => {};

export class ApiError extends Error {
  constructor(status, data) {
    super((data && (data.detail || data.message)) || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

// ---------- tokens (sessionStorage: cleared when the browser tab closes) ----------
export const tokenStore = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem(TOKEN_KEY)) || null;
    } catch {
      return null;
    }
  },
  set(tokens) {
    try {
      sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } catch {
      /* storage blocked – the session lasts until reload */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export function setSignedOutHandler(fn) {
  onSignedOut = fn;
}

// ---------- helpers ----------
export function buildUrl(path, params) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params) return url;
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

function describeBody(body) {
  if (body instanceof FormData) {
    const out = {};
    body.forEach((v, k) => (out[k] = v instanceof File ? `File(${v.name}, ${v.size} bytes)` : v));
    return out;
  }
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const out = { ...body };
    SECRET_FIELDS.forEach((f) => out[f] && (out[f] = "••••••"));
    return out;
  }
  return body ?? null;
}

function logRequest(method, url, body, extra = "") {
  if (!LOG_API) return () => {};
  const color = { GET: "#2563eb", POST: "#16a34a", PATCH: "#d97706", PUT: "#d97706", DELETE: "#dc2626" }[method] || "#555";
  console.groupCollapsed(`%c[API] ${method}%c ${url} ${extra}`, `color:${color};font-weight:700`, "color:inherit");
  console.log("payload:", describeBody(body));
  return () => console.groupEnd();
}


// ---------- the real request ----------
async function realFetch(method, url, body, auth, retry = true) {
  const headers = { Accept: "application/json" };
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const tokens = tokenStore.get();
  if (auth && tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;

  const res = await fetch(url, { method, headers, body: body === undefined ? undefined : isForm ? body : JSON.stringify(body) });

  if (res.status === 401 && auth && retry && tokens?.refresh) {
    if (await refreshTokens(tokens.refresh)) return realFetch(method, url, body, auth, false);
    tokenStore.clear();
    onSignedOut();
  }
  const type = res.headers.get("content-type") || "";
  const data = res.status === 204 ? null : type.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

async function refreshTokens(refresh) {
  try {
    const res = await fetch(buildUrl("/auth/token/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStore.set({ access: data.access, refresh: data.refresh });
    return true;
  } catch {
    return false;
  }
}

async function request(method, path, { params, body, auth = true } = {}) {
  const url = buildUrl(path, params);
  const end = logRequest(method, url, body);
  try {
    const data = await realFetch(method, url, body, auth);
    if (LOG_API) console.log("response:", data);
    return data;
  } catch (err) {
    if (LOG_API) console.warn("error:", err.status || "", err.message, err.data || "");
    throw err;
  } finally {
    end();
  }
}

export const api = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body, opts = {}) => request("POST", path, { ...opts, body }),
  patch: (path, body, opts = {}) => request("PATCH", path, { ...opts, body }),
  put: (path, body, opts = {}) => request("PUT", path, { ...opts, body }),
  delete: (path, opts) => request("DELETE", path, opts),
};

/** DRF list answer -> array (works for paginated {results} and plain lists). */
export const rows = (data) => (Array.isArray(data) ? data : data?.results || []);
