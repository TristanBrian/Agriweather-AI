import axios, { AxiosError } from 'axios';

// ---------------- Axios instance ----------------
const weatherAI = axios.create({
  baseURL: 'https://api.weather-ai.co',
  headers: {
    Authorization: `Bearer ${process.env.WEATHER_AI_API_KEY}`,
  },
  timeout: 15_000,
});

weatherAI.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      throw new ApiError(status, (data as any)?.message || 'External API error');
    }
    throw new ApiError(500, 'Network or internal error');
  }
);

export default weatherAI; // ← default export for direct use (POST, etc.)

// ---------------- Custom error class ----------------
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ---------------- Convenience GET wrapper ----------------
export async function weatherAIGet(path: string, params: Record<string, string | number | boolean>) {
  const response = await weatherAI.get(path, { params });
  return response.data;
}