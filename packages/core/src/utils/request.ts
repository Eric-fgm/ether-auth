export const request = async <T>(
  input: string | URL,
  init?: Omit<RequestInit, "body"> & { body?: Record<string, unknown> }
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    headers: { ...init?.headers, "Content-Type": "application/json" },
  });

  return (await response.json()) as T;
};
