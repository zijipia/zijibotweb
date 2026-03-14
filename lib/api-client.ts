// Client-side API helper that automatically includes credentials for cookies
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url, {
    method: 'GET',
  });
}

export async function apiPost<T = any>(
  url: string,
  body?: any
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T = any>(
  url: string,
  body?: any
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url, {
    method: 'DELETE',
  });
}
