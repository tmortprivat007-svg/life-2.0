import { useState } from 'react';
import {
  Cloud,
  Mail,
  Heart,
  Link2,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card, SectionHeader, Modal, Badge } from '@/components/ui';
import { useAppData, defaultIntegrations } from '@/store/AppData';
import type { IntegrationStatus, IntegrationId, DataSource } from '@/types';

const integrationIcons: Record<IntegrationId, typeof Cloud> = {
  icloud_calendar: Cloud,
  gmail: Mail,
  myfitnesspal: Heart,
};

const integrationColors: Record<IntegrationId, string> = {
  icloud_calendar: '#3b82f6',
  gmail: '#ef4444',
  myfitnesspal: '#22c55e',
};

const integrationDataTypes: Record<IntegrationId, string> = {
  icloud_calendar: 'Kalenderbegivenheder',
  gmail: 'Mails og opfølgninger',
  myfitnesspal: 'Ernæring og kalorier',
};

export function Integrationer() {
  const { integrations, setIntegrations } = useAppData();
  const [connectModal, setConnectModal] = useState<IntegrationId | null>(null);
  const [infoModal, setInfoModal] = useState<IntegrationId | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connectedCount = integrations.filter(i => i.status === 'available' || i.status === 'syncing').length;

  const handleConnect = (id: IntegrationId) => {
    setConnecting(true);
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'syncing', message: 'Forbinder...' } : i
    ));

    setTimeout(() => {
      setIntegrations(prev => prev.map(i =>
        i.id === id ? {
          ...i,
          status: 'available',
          lastSynced: new Date().toISOString(),
          message: 'Forbundet. Data vil blive hentet ved næste synkronisering.',
        } : i
      ));
      setConnecting(false);
      setConnectModal(null);
    }, 2000);
  };

  const handleDisconnect = (id: IntegrationId) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? {
        ...i,
        status: 'disconnected',
        lastSynced: null,
        message: 'Ikke forbundet. Tilslut for at hente data automatisk.',
      } : i
    ));
  };

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 size={16} className="text-accent-green" />;
      case 'syncing':
        return <Loader2 size={16} className="text-accent-cyan animate-spin" />;
      case 'error':
        return <XCircle size={16} className="text-accent-red" />;
      default:
        return <Link2 size={16} className="text-slate-500" />;
    }
  };

  const getStatusLabel = (status: IntegrationStatus['status']): string => {
    switch (status) {
      case 'available':
        return 'Forbundet';
      case 'syncing':
        return 'Forbinder...';
      case 'error':
        return 'Fejl';
      default:
        return 'Ikke forbundet';
    }
  };

  const getStatusColor = (status: IntegrationStatus['status']): string => {
    switch (status) {
      case 'available':
        return '#22c55e';
      case 'syncing':
        return '#06b6d4';
      case 'error':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrationer</h1>
          <p className="text-xs text-slate-400 mt-0.5">{connectedCount} af {integrations.length} forbundet</p>
        </div>
      </div>

      {/* Overview card */}
      <Card delay={50}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 flex items-center justify-center">
            <Info size={20} className="text-accent-cyan" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Datakilder</p>
            <p className="text-xs text-slate-400 mt-0.5">
              LIFE 2.0 bruger manuelt indtastede data. Tilslut integrationer for at synkronisere automatisk.
            </p>
          </div>
        </div>
      </Card>

      {/* Integration cards */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader title="Tilgængelige integrationer" subtitle="Forberedt til fremtidig synkronisering" />
        <div className="space-y-3">
          {integrations.map(integration => {
            const Icon = integrationIcons[integration.id];
            const color = integrationColors[integration.id];
            const statusColor = getStatusColor(integration.status);
            return (
              <Card key={integration.id}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{integration.name}</h3>
                      {getStatusIcon(integration.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{integration.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge text={getStatusLabel(integration.status)} color={statusColor} />
                      {integration.lastSynced && (
                        <span className="text-[10px] text-slate-500">
                          Sidst synk: {new Date(integration.lastSynced).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">{integration.message}</p>

                    <div className="flex items-center gap-2 mt-3">
                      {integration.status === 'disconnected' || integration.status === 'error' ? (
                        <button
                          onClick={() => setConnectModal(integration.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95"
                          style={{ background: `${color}25`, color }}
                        >
                          Tilslut
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-400 transition-all active:scale-95"
                        >
                          Afbryd
                        </button>
                      )}
                      <button
                        onClick={() => setInfoModal(integration.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-400 transition-all active:scale-95"
                      >
                        Detaljer
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Data source status */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <SectionHeader title="Datakilde-status" subtitle="Hordan data håndteres pr. område" />
        <Card>
          <div className="space-y-3">
            <DataRow label="Kalender" source="unavailable" integration="icloud_calendar" />
            <DataRow label="Mail" source="unavailable" integration="gmail" />
            <DataRow label="Ernæring" source="unavailable" integration="myfitnesspal" />
            <DataRow label="Vægt" source="manual" />
            <DataRow label="Træning" source="manual" />
            <DataRow label="Opgaver" source="manual" />
            <DataRow label="Økonomi" source="manual" />
            <DataRow label="Rejser" source="manual" />
            <DataRow label="Arbejde" source="manual" />
          </div>
        </Card>
      </div>

      {/* Connect modal */}
      <Modal open={!!connectModal} onClose={() => !connecting && setConnectModal(null)} title={connectModal ? integrations.find(i => i.id === connectModal)?.name || '' : ''}>
        {connectModal && (
          <div className="space-y-4">
            {(() => {
              const integration = integrations.find(i => i.id === connectModal)!;
              const Icon = integrationIcons[connectModal];
              const color = integrationColors[connectModal];
              return (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                      <Icon size={24} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{integration.name}</p>
                      <p className="text-xs text-slate-400">{integrationDataTypes[connectModal]}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-300">
                      Ved tilslutning vil LIFE 2.0 forsøge at forbinde til {integration.name}. Denne integration er forberedt men endnu ikke fuldt aktiveret.
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Bemærk: Integrationen markeres som forbundet, men data synkroniseres først når API-adgang er fuldt konfigureret.
                  </p>
                  <button
                    onClick={() => handleConnect(connectModal)}
                    disabled={connecting}
                    className="w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                    style={{ background: color }}
                  >
                    {connecting ? (
                      <><Loader2 size={16} className="animate-spin" /> Forbinder...</>
                    ) : (
                      <><Link2 size={16} /> Tilslut {integration.name}</>
                    )}
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Info modal */}
      <Modal open={!!infoModal} onClose={() => setInfoModal(null)} title={infoModal ? integrations.find(i => i.id === infoModal)?.name || '' : ''}>
        {infoModal && (
          <div className="space-y-4">
            {(() => {
              const integration = integrations.find(i => i.id === infoModal)!;
              const Icon = integrationIcons[infoModal];
              const color = integrationColors[infoModal];
              return (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                      <Icon size={24} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{integration.name}</p>
                      <p className="text-xs text-slate-400">{integration.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InfoRow label="Data type" value={integrationDataTypes[infoModal]} />
                    <InfoRow label="Status" value={getStatusLabel(integration.status)} />
                    <InfoRow label="Sidst synkroniseret" value={integration.lastSynced ? new Date(integration.lastSynced).toLocaleString('da-DK') : 'Aldrig'} />
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-300">{integration.message}</p>
                  </div>

                  <div className="p-3 bg-accent-amber/10 rounded-xl border border-accent-amber/20">
                    <p className="text-xs text-accent-amber">
                      Integrationen er forberedt i LIFE 2.0 og vil blive aktiveret i en fremtidig opdatering. Du kan tilslutte nu for at markere din intention om at bruge tjenesten.
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}

function DataRow({ label, source, integration }: { label: string; source: DataSource; integration?: IntegrationId }) {
  const { integrations } = useAppData();
  let currentSource = source;

  if (integration) {
    const int = integrations.find(i => i.id === integration);
    if (int && (int.status === 'available' || int.status === 'syncing')) {
      currentSource = 'synced';
    } else {
      currentSource = 'unavailable';
    }
  }

  const sourceLabels: Record<DataSource, string> = {
    manual: 'Manuelt',
    synced: 'Synkroniseret',
    unavailable: 'Ikke tilgængeligt',
  };

  const sourceColors: Record<DataSource, string> = {
    manual: '#06b6d4',
    synced: '#22c55e',
    unavailable: '#64748b',
  };

  return (
    <div className="flex items-center justify-between py-1.5 border-t border-white/5 first:border-t-0">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: sourceColors[currentSource] }} />
        <span className="text-xs" style={{ color: sourceColors[currentSource] }}>{sourceLabels[currentSource]}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}
