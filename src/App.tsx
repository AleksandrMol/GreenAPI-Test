import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { greenApi } from './api/greenApi';
import { ChatSidebar } from './components/ChatSidebar';
import { Conversation } from './components/Conversation';
import { ErrorToast } from './components/ErrorToast';
import { SettingsModal, type SettingsValues } from './components/SettingsModal';
import { useNotifications } from './hooks/useNotifications';
import type { ChatMessage, GreenApiConfig } from './types/chat';

const DEFAULT_API_URL = 'https://4100.api.green-api.com';

function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  return `${digits}@c.us`;
}

export default function App() {
  const [settings, setSettings] = useState<SettingsValues>({
    apiUrl: DEFAULT_API_URL,
    idInstance: '',
    apiTokenInstance: '',
  });
  const [chatInput, setChatInput] = useState('');
  const [activeChatId, setActiveChatId] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const config = useMemo<GreenApiConfig | null>(() => {
    const { apiUrl, idInstance, apiTokenInstance } = settings;
    if (!apiUrl.trim() || !idInstance.trim() || !apiTokenInstance.trim()) return null;

    return {
      apiUrl: apiUrl.trim(),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };
  }, [settings]);

  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => (
      current.some((item) => item.id === message.id) ? current : [...current, message]
    ));
  }, []);

  const handlePollingError = useCallback((message: string) => setError(message), []);

  useNotifications({
    config,
    activeChatId,
    onMessage: handleIncomingMessage,
    onError: handlePollingError,
  });

  const openChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phoneNumber = chatInput.trim();
    if (!phoneNumber) return;

    const digits = phoneNumber.replace(/\D/g, '');
    if (!digits) {
      setError('Введи корректный номер телефона в международном формате');
      return;
    }

    const chatId = normalizePhoneNumber(phoneNumber);

    setActiveChatId(chatId);
    setMessages([]);
    setDraft('');
    setError('');
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!config || !activeChatId || !text || isSending) return;

    const temporaryId = `local-${Date.now()}`;
    const outgoingMessage: ChatMessage = {
      id: temporaryId,
      chatId: activeChatId,
      text,
      timestamp: Date.now(),
      direction: 'outgoing',
      status: 'sending',
    };

    setMessages((current) => [...current, outgoingMessage]);
    setDraft('');
    setIsSending(true);
    setError('');

    try {
      await greenApi.sendMessage(config, activeChatId, text);
      setMessages((current) => current.map((message) => (
        message.id === temporaryId ? { ...message, status: 'sent' } : message
      )));
    } catch (requestError) {
      const errorMessage = requestError instanceof Error
        ? requestError.message
        : 'Не удалось отправить сообщение';

      setMessages((current) => current.map((message) => (
        message.id === temporaryId ? { ...message, status: 'error' } : message
      )));
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const updateSetting = (field: keyof SettingsValues, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsOpen(false);
    setError('');
  };

  const chatName = activeChatId;

  return (
    <main className="app-shell">
      <ChatSidebar
        chatInput={chatInput}
        activeChatId={activeChatId}
        chatName={chatName}
        lastMessage={messages.at(-1)?.text}
        isConfigured={Boolean(config)}
        onChatInputChange={setChatInput}
        onOpenChat={openChat}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <Conversation
        chatId={activeChatId}
        chatName={chatName}
        messages={messages}
        draft={draft}
        isConfigured={Boolean(config)}
        isSending={isSending}
        onDraftChange={setDraft}
        onSend={sendMessage}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <ErrorToast message={error} onClose={() => setError('')} />

      {settingsOpen && (
        <SettingsModal
          values={settings}
          onChange={updateSetting}
          isRequired={!config}
          onClose={() => { if (config) setSettingsOpen(false); }}
          onSave={saveSettings}
        />
      )}
    </main>
  );
}
