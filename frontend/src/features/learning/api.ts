export async function request<T>(
  path: string, validate: (value: unknown) => value is T,
  signal: AbortSignal, body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    signal,
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? { Accept: 'application/json' }
      : { Accept: 'application/json', 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data
      && typeof data.message === 'string' ? data.message : `A API respondeu com HTTP ${response.status}.`;
    throw new Error(message);
  }
  if (!validate(data)) throw new Error('O conteúdo recebido tem um formato inesperado.');
  return data;
}
