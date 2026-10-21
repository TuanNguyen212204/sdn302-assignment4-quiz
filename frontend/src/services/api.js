const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3004";

export async function apiRequest(path, options = {}) {
  const headers = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = "Bearer " + options.token;
  }

  let response;
  try {
    response = await fetch(apiUrl + path, {
      method: options.method || "GET",
      headers: headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Cannot connect to the server. Please try again.");
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "The request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}
