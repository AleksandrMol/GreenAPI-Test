export interface GreenApiConfig {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  direction: 'outgoing' | 'incoming';
  status?: 'sending' | 'sent' | 'error';
}

export interface NotificationBody {
  typeWebhook?: string;
  timestamp?: number;
  idMessage?: string;
  senderData?: { chatId?: string; chatName?: string; senderName?: string };
  messageData?: { typeMessage?: string; textMessageData?: { textMessage?: string } };
}

export interface ReceiveNotificationResponse {
  receiptId?: number;
  body?: NotificationBody;
}
