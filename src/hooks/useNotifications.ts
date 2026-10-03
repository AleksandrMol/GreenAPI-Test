import { useEffect } from 'react';
import { greenApi } from '../api/greenApi';
import type { ChatMessage, GreenApiConfig, NotificationBody } from '../types/chat';

interface UseNotificationsOptions {
  config: GreenApiConfig | null;
  activeChatId: string;
  onMessage: (message: ChatMessage) => void;
  onError: (error: string) => void;
}

const POLLING_RETRY_DELAY = 2_500;

function waitForRetry(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, POLLING_RETRY_DELAY));
}

export function useNotifications({
  config,
  activeChatId,
  onMessage,
  onError,
}: UseNotificationsOptions) {
  useEffect(() => {
    if (!config || !activeChatId) return;

    const controller = new AbortController();
    let isStopped = false;

    const pollNotifications = async () => {
      while (!isStopped) {
        try {
          const notification = await greenApi.receiveNotification(config, controller.signal);
          if (!notification) continue;

          if (typeof notification.receiptId !== 'number') {
            throw new Error('GREEN-API вернул уведомление без receiptId');
          }

          processNotification(notification.body, activeChatId, onMessage);

          const deletion = await greenApi.deleteNotification(config, notification.receiptId);
          if (deletion.result === false) {
            throw new Error(
              deletion.reason || `Не удалось удалить уведомление ${notification.receiptId}`,
            );
          }
        } catch (error) {
          if (isStopped || (error instanceof DOMException && error.name === 'AbortError')) {
            break;
          }

          onError(error instanceof Error ? error.message : 'Ошибка получения уведомлений');
          await waitForRetry();
        }
      }
    };

    void pollNotifications();

    return () => {
      isStopped = true;
      controller.abort();
    };
  }, [config, activeChatId, onMessage, onError]);
}

function processNotification(
  body: NotificationBody | undefined,
  activeChatId: string,
  onMessage: (message: ChatMessage) => void,
) {
  if (
    body?.typeWebhook !== 'incomingMessageReceived' ||
    body.messageData?.typeMessage !== 'textMessage'
  ) {
    return;
  }

  const chatId = body.senderData?.chatId;
  const text = body.messageData.textMessageData?.textMessage;

  if (chatId !== activeChatId || !text) return;

  onMessage({
    id: body.idMessage ?? `${Date.now()}-${Math.random()}`,
    chatId,
    text,
    timestamp: (body.timestamp ?? Math.floor(Date.now() / 1_000)) * 1_000,
    direction: 'incoming',
  });
}
