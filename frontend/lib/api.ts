const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = false, headers, ...rest } = options;
  const config: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (requireAuth) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const hasToken = token && token !== "undefined" && token !== "null";

      // Avoid making an auth request if we already know the token is missing/invalid
      if (!hasToken) {
        localStorage.removeItem("auth_token");
        throw new Error("Not authenticated");
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, config);

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || `HTTP Error ${response.status}`);
  }

  return (data || null) as T;
}
