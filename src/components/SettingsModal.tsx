import { Check, X } from 'lucide-react';
import type { FormEvent } from 'react';

export interface SettingsValues {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

interface SettingsModalProps {
  values: SettingsValues;
  onChange: (field: keyof SettingsValues, value: string) => void;
  onClose: () => void;
  isRequired: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}

export function SettingsModal({ values, onChange, onClose, onSave, isRequired }: SettingsModalProps) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (!isRequired && event.target === event.currentTarget) onClose();
      }}
    >
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header>
          <div>
            <h2 id="settings-title">Подключение GREEN-API</h2>
            <p>{isRequired ? 'Для начала работы укажи данные своего инстанса.' : 'Данные хранятся только в состоянии текущей вкладки.'}</p>
          </div>
          {!isRequired && (
            <button className="icon-button" onClick={onClose} aria-label="Закрыть">
              <X size={20} />
            </button>
          )}
        </header>

        <form onSubmit={onSave}>
          <label>
            API URL
            <input
              value={values.apiUrl}
              onChange={(event) => onChange('apiUrl', event.target.value)}
              required
            />
          </label>
          <label>
            idInstance
            <input
              value={values.idInstance}
              onChange={(event) => onChange('idInstance', event.target.value)}
              placeholder="ID инстанса"
              required
            />
          </label>
          <label>
            apiTokenInstance
            <input
              type="password"
              value={values.apiTokenInstance}
              onChange={(event) => onChange('apiTokenInstance', event.target.value)}
              placeholder="Токен инстанса"
              required
            />
          </label>
          <div className="settings-note">
            <Check size={15} />
            Токен не сохраняется в localStorage и не отправляется на сторонние серверы.
          </div>
          <button className="primary-button" type="submit">Сохранить настройки</button>
        </form>
      </section>
    </div>
  );
}
