import { Settings } from 'lucide-react';

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-wider">
            Settings
          </h1>
        </div>
        <p className="text-muted-foreground">Coming soon — more settings will be added here.</p>
      </div>

      <div className="coaching-card p-6 border-l-4 border-yellow-500/50 bg-yellow-500/5">
        <h3 className="font-bold text-foreground mb-2">⚠️ Wild Rift API</h3>
        <p className="text-sm text-muted-foreground">
          Riot does not provide a public API for Wild Rift, so automatic account sync is not possible.
          The counterpick database and coaching features work independently without any account connection.
        </p>
      </div>
    </div>
  );
}
