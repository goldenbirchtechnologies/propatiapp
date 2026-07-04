'use client';

interface ToggleItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (id: string, value: boolean) => void;
}

interface ProfileNotificationsProps {
  title: string;
  description: string;
  items: ToggleItem[];
}

export default function ProfileNotifications({ title, description, items }: ProfileNotificationsProps) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)] p-6">
      <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
            </div>
            <button
              onClick={() => item.onToggle(item.id, !item.enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2 ${
                item.enabled ? 'bg-[var(--primary)]' : 'bg-[var(--border-default)]'
              }`}
              role="switch"
              aria-checked={item.enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  item.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
