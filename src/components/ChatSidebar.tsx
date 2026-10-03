import { ArrowLeft, MessageCircle, Send, Settings2 } from 'lucide-react';
import type { FormEvent } from 'react';

interface ChatSidebarProps {
  chatInput: string;
  activeChatId: string;
  chatName: string;
  lastMessage?: string;
  isConfigured: boolean;
  onChatInputChange: (value: string) => void;
  onOpenChat: (event: FormEvent<HTMLFormElement>) => void;
  onOpenSettings: () => void;
}

export function ChatSidebar({
  chatInput,
  activeChatId,
  chatName,
  lastMessage,
  isConfigured,
  onChatInputChange,
  onOpenChat,
  onOpenSettings,
}: ChatSidebarProps) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="brand-mark"><Send size={19} /></div>
        <span>Telegram</span>
        <button className="icon-button settings-button" title="Настройки" onClick={onOpenSettings}>
          <Settings2 size={19} />
        </button>
      </header>

      <div className="search-wrap">
        <form onSubmit={onOpenChat}>
          <input
            aria-label="Номер телефона"
            value={chatInput}
            onChange={(event) => onChatInputChange(event.target.value)}
            placeholder="Номер телефона получателя"
          />
          <button aria-label="Открыть чат" type="submit"><ArrowLeft size={17} /></button>
        </form>
      </div>

      {activeChatId ? (
        <button className="chat-preview active" type="button">
          <div className="avatar">{chatName.slice(0, 1)}</div>
          <div className="chat-preview-copy">
            <strong>{chatName}</strong>
            <span>{lastMessage ?? 'Чат открыт'}</span>
          </div>
        </button>
      ) : (
        <div className="empty-sidebar">
          <MessageCircle size={27} />
          <p>Введи номер телефона, чтобы создать чат</p>
        </div>
      )}

      <footer className="sidebar-footer">
        <span className={`status-dot${isConfigured ? ' online' : ''}`} />
        {isConfigured ? 'GREEN-API настроен' : 'Требуется авторизация'}
      </footer>
    </aside>
  );
}
