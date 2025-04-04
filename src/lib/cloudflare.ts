type CloudflareResponse<T> = {
  success: boolean;
  result: T;
  errors: any[];
  messages: any[];
};

export interface Zone {
  id: string;
  name: string;
  status: string;
  paused: boolean;
  type: string;
}

type CloudflareEntities = {
  zones: Zone[];
};

export async function fetchCloudflareData<K extends keyof CloudflareEntities>(
  endpoint: K,
  email: string,
  apiKey: string
): Promise<CloudflareEntities[K]> {
  const response = await fetch(
    `https://cortex.app.taralys.com/client/v4/${endpoint}`,
    {
      method: "GET",
      headers: {
        "X-Auth-Email": email,
        "X-Auth-Key": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  const data: CloudflareResponse<CloudflareEntities[K]> = await response.json();

  if (!response.ok) {
    throw new Error(
      data.errors?.length
        ? data.errors.map((e) => e.message).join(", ")
        : `Request failed with status ${response.status}`
    );
  }

  if (!data.success) {
    throw new Error("API returned unsuccessful status");
  }

  return data.result;
}
