import { Check, CheckCheck, MessageCircle, Send, Settings2 } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { ChatMessage } from '../types/chat';

interface ConversationProps {
  chatId: string;
  chatName: string;
  messages: ChatMessage[];
  draft: string;
  isConfigured: boolean;
  isSending: boolean;
  onDraftChange: (value: string) => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
  onOpenSettings: () => void;
}

function MessageStatus({ status }: { status: ChatMessage['status'] }) {
  if (status === 'sending') return <Check size={13} className="muted" />;
  if (status === 'error') return <span className="failed">!</span>;
  return <CheckCheck size={15} className="read-check" />;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message-row ${message.direction}`}>
      <div className="message-bubble">
        <p>{message.text}</p>
        <div className="message-meta">
          <time>{time}</time>
          {message.direction === 'outgoing' && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

export function Conversation({
  chatId,
  chatName,
  messages,
  draft,
  isConfigured,
  isSending,
  onDraftChange,
  onSend,
  onOpenSettings,
}: ConversationProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  if (!chatId) {
    return (
      <section className="conversation">
        <div className="welcome">
          <div className="welcome-art"><MessageCircle size={42} /></div>
          <h1>Telegram Web</h1>
          <p>Введи номер телефона в поле слева, чтобы начать общение.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="conversation">
      <header className="conversation-header">
        <div className="avatar large">{chatName.slice(0, 1)}</div>
        <div className="conversation-title">
          <strong>{chatName}</strong>
          <span>Telegram</span>
        </div>
        <button className="icon-button mobile-settings" onClick={onOpenSettings} aria-label="Настройки">
          <Settings2 size={20} />
        </button>
      </header>

      <div className="messages-area" aria-live="polite">
        <div className="date-divider"><span>Сообщения</span></div>
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {messages.length === 0 && (
          <div className="chat-placeholder">
            <div className="placeholder-icon"><MessageCircle size={30} /></div>
            <strong>Начни переписку</strong>
            <span>Отправь первое сообщение в этот чат</span>
          </div>
        )}
      </div>

      <form className="composer" onSubmit={onSend}>
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          rows={1}
          disabled={!isConfigured}
          aria-label="Текст сообщения"
        />
        <button
          type="submit"
          disabled={!isConfigured || !draft.trim() || isSending}
          aria-label="Отправить сообщение"
        >
          <Send size={19} />
        </button>
      </form>
    </section>
  );
}
