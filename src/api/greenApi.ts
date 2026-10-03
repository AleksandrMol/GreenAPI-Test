import type { GreenApiConfig, ReceiveNotificationResponse } from '../types/chat';

function buildEndpoint(config: GreenApiConfig, method: string): string {
  const baseUrl = config.apiUrl.replace(/\/$/, '');
  const instanceId = encodeURIComponent(config.idInstance);
  const token = encodeURIComponent(config.apiTokenInstance);

  return `${baseUrl}/waInstance${instanceId}/${method}/${token}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const rawResponse = await response.text();

  let data: unknown;
  try {
    data = rawResponse ? JSON.parse(rawResponse) : null;
  } catch {
    data = rawResponse;
  }

  if (!response.ok) {
    const detail = typeof data === 'object' && data !== null && 'message' in data
      ? String(data.message)
      : `${response.status} ${response.statusText}`;

    throw new Error(detail);
  }

  return data as T;
}

export const greenApi = {
  sendMessage(config: GreenApiConfig, chatId: string, message: string) {
    return request<{ idMessage: string }>(buildEndpoint(config, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    });
  },

  receiveNotification(config: GreenApiConfig, signal: AbortSignal) {
    const url = `${buildEndpoint(config, 'receiveNotification')}?receiveTimeout=5`;
    return request<ReceiveNotificationResponse | null>(url, { signal });
  },

  deleteNotification(config: GreenApiConfig, receiptId: number) {
    // GREEN-API expects the token before the receipt ID.
    const url = `${buildEndpoint(config, 'deleteNotification')}/${encodeURIComponent(String(receiptId))}`;
    return request<{ result?: boolean; reason?: string }>(url, { method: 'DELETE' });
  },
};
