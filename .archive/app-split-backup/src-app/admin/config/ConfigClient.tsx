'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  ArrowLeft,
  ShieldCheck,
  Puzzle,
  Workflow,
  Map,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Globe,
  Lock,
  Server,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
type IntegrationStatus = 'connected' | 'disconnected' | 'error';

interface IntegrationEntry {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastPingedAt: string;
  configUrl?: string;
}

type FeatureFlag = 'on' | 'off' | 'beta';

interface FeatureEntry {
  id: string;
  name: string;
  description: string;
  status: FeatureFlag;
  rolloutPct: number;
  updatedAt: string;
}

type MapProvider = 'google' | 'mapbox' | 'none';

interface MapConfig {
  provider: MapProvider;
  apiKey: string;
  defaultCenterLat: string;
  defaultCenterLng: string;
  defaultZoom: number;
  geocodingEnabled: boolean;
  trafficLayerEnabled: boolean;
}

interface ConfigClientProps {
  initialError?: string;
  initialIntegrations?: IntegrationEntry[];
  initialFeatures?: FeatureEntry[];
  initialMapConfig?: MapConfig;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function integrationStatusBadge(status: IntegrationStatus) {
  switch (status) {
    case 'connected':
      return <Badge className="tag-green">Connected</Badge>;
    case 'disconnected':
      return <Badge className="tag-gray">Disconnected</Badge>;
    case 'error':
      return <Badge className="tag-red">Error</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function featureStatusBadge(status: FeatureFlag) {
  switch (status) {
    case 'on':
      return <Badge className="tag-green">Enabled</Badge>;
    case 'off':
      return <Badge className="tag-gray">Disabled</Badge>;
    case 'beta':
      return <Badge className="tag-blue">Beta</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const DEFAULT_INTEGRATIONS: IntegrationEntry[] = [
  {
    id: 'int_paystack',
    name: 'Paystack',
    description: 'Payment processing and disbursements.',
    status: 'connected',
    lastPingedAt: new Date().toISOString(),
    configUrl: 'https://api.paystack.co',
  },
  {
    id: 'int_twilio',
    name: 'Twilio',
    description: 'SMS and voice notifications.',
    status: 'connected',
    lastPingedAt: new Date().toISOString(),
  },
  {
    id: 'int_sendgrid',
    name: 'SendGrid',
    description: 'Transactional email delivery.',
    status: 'error',
    lastPingedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'int_cloudinary',
    name: 'Cloudinary',
    description: 'Media storage and transformations.',
    status: 'disconnected',
    lastPingedAt: '',
  },
];

const DEFAULT_FEATURES: FeatureEntry[] = [
  {
    id: 'feat_shortlet',
    name: 'Short-let Listings',
    description: 'Enable short-let rental listing workflows.',
    status: 'on',
    rolloutPct: 100,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat_escrow',
    name: 'Escrow Payments',
    description: 'Allow escrow-based transactions.',
    status: 'beta',
    rolloutPct: 25,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat_ai_match',
    name: 'AI Tenant Matching',
    description: 'Use AI to recommend properties to tenants.',
    status: 'off',
    rolloutPct: 0,
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_MAP_CONFIG: MapConfig = {
  provider: 'google',
  apiKey: '',
  defaultCenterLat: '9.0820',
  defaultCenterLng: '8.6753',
  defaultZoom: 12,
  geocodingEnabled: true,
  trafficLayerEnabled: false,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConfigClient({
  initialError,
  initialIntegrations = DEFAULT_INTEGRATIONS,
  initialFeatures = DEFAULT_FEATURES,
  initialMapConfig = DEFAULT_MAP_CONFIG,
}: ConfigClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(initialError || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [integrations, setIntegrations] = useState<IntegrationEntry[]>(initialIntegrations);
  const [features, setFeatures] = useState<FeatureEntry[]>(initialFeatures);
  const [mapConfig, setMapConfig] = useState<MapConfig>(initialMapConfig);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((i) => {
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [integrations, searchTerm, statusFilter]);

  const updateIntegrationStatus = (id: string, status: IntegrationStatus) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, lastPingedAt: new Date().toISOString() } : i)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({
        title: 'Configuration saved',
        description: 'Global config has been updated.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    } catch {
      toast({
        title: 'Save failed',
        description: 'Could not persist config changes.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    router.refresh();
  };

  const handleTestConnection = async (id: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      updateIntegrationStatus(id, 'connected');
      toast({
        title: 'Connection test passed',
        description: 'Integration is healthy.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    } catch {
      updateIntegrationStatus(id, 'error');
      toast({
        title: 'Connection test failed',
        description: 'Could not reach the integration endpoint.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Global Config</h1>
            <p className="text-muted-foreground mt-1">Manage integrations, feature flags, and mapping.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Unable to load config</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Global Config
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Manage integrations, feature flags, and mapping settings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </span>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="w-full grid grid-cols-3 max-w-lg">
          <TabsTrigger value="integrations">
            <Puzzle className="h-4 w-4 mr-2" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="features">
            <Workflow className="h-4 w-4 mr-2" /> Features
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" /> Map
          </TabsTrigger>
        </TabsList>

        {/* ─── Integrations ───────────────────────────────────────────────── */}
        <TabsContent value="integrations" className="mt-6 space-y-4">
          <div className="card p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--muted)' }}
                />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
                <option value="error">Error</option>
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {filteredIntegrations.length === 0 ? (
            <div className="text-center py-16 card">
              <Puzzle className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
              <p className="text-lg font-medium mt-4" style={{ color: 'var(--muted)' }}>
                No integrations found
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'No integrations configured yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIntegrations.map((intg) => (
                <div key={intg.id} className="card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="rounded-md flex-shrink-0 flex items-center justify-center"
                        style={{
                          width: 36,
                          height: 36,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Server className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                          {intg.name}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {intg.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          {intg.lastPingedAt
                            ? `Last pinged: ${new Date(intg.lastPingedAt).toLocaleString()}`
                            : 'Never pinged'}
                        </p>
                      </div>
                    </div>
                    {integrationStatusBadge(intg.status)}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(intg.id)}
                      disabled={loading || intg.status === 'disconnected'}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" /> Test Connection
                    </Button>
                    {intg.configUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={intg.configUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> Open
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Features ───────────────────────────────────────────────────── */}
        <TabsContent value="features" className="mt-6 space-y-4">
          <div className="space-y-4">
            {features.map((feat) => (
              <div key={feat.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                        {feat.name}
                      </h3>
                      {featureStatusBadge(feat.status)}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      {feat.description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      Rollout: {feat.rolloutPct}% · Updated {new Date(feat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = feat.status === 'on' ? 'off' : 'on';
                        setFeatures((prev) =>
                          prev.map((f) =>
                            f.id === feat.id
                              ? { ...f, status: next, rolloutPct: next === 'on' ? 100 : 0 }
                              : f,
                          ),
                        );
                      }}
                    >
                      {feat.status === 'on' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const next =
                          feat.status === 'beta'
                            ? 'on'
                            : feat.status === 'on'
                            ? 'beta'
                            : 'off';
                        setFeatures((prev) =>
                          prev.map((f) =>
                            f.id === feat.id
                              ? {
                                  ...f,
                                  status: next,
                                  rolloutPct: next === 'on' ? 100 : next === 'beta' ? 25 : 0,
                                }
                              : f,
                          ),
                        );
                      }}
                    >
                      Cycle status
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ─── Map ───────────────────────────────────────────────────────── */}
        <TabsContent value="map" className="mt-6 space-y-4">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
              Map Configuration
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mapProvider">Provider</Label>
                  <select
                    id="mapProvider"
                    value={mapConfig.provider}
                    onChange={(e) =>
                      setMapConfig({ ...mapConfig, provider: e.target.value as MapProvider })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="google">Google Maps</option>
                    <option value="mapbox">Mapbox</option>
                    <option value="none">None / Disabled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mapApiKey">API Key</Label>
                  <Input
                    id="mapApiKey"
                    value={mapConfig.apiKey}
                    onChange={(e) => setMapConfig({ ...mapConfig, apiKey: e.target.value })}
                    placeholder="Enter map API key"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  Default Location
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultLat">Latitude</Label>
                    <Input
                      id="defaultLat"
                      value={mapConfig.defaultCenterLat}
                      onChange={(e) =>
                        setMapConfig({ ...mapConfig, defaultCenterLat: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLng">Longitude</Label>
                    <Input
                      id="defaultLng"
                      value={mapConfig.defaultCenterLng}
                      onChange={(e) =>
                        setMapConfig({ ...mapConfig, defaultCenterLng: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultZoom">Zoom Level</Label>
                    <Input
                      id="defaultZoom"
                      type="number"
                      min={1}
                      max={20}
                      value={mapConfig.defaultZoom}
                      onChange={(e) =>
                        setMapConfig({
                          ...mapConfig,
                          defaultZoom: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>Geocoding</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Enable address geocoding</p>
                  </div>
                  <Switch
                    checked={mapConfig.geocodingEnabled}
                    onCheckedChange={(checked) =>
                      setMapConfig({ ...mapConfig, geocodingEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>Traffic Layer</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Show real-time traffic overlay</p>
                  </div>
                  <Switch
                    checked={mapConfig.trafficLayerEnabled}
                    onCheckedChange={(checked) =>
                      setMapConfig({ ...mapConfig, trafficLayerEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
