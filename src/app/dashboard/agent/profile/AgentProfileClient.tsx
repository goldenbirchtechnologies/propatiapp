'use client';

import { useMemo } from 'react';
import {
  Mail,
  Phone,
  Shield,
  Calendar,
  UserCircle,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKycStatus } from '@/lib/dojah-client';
import KycVerificationCard from '@/components/verification/KycVerificationCard';

type ProfileData = {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
  agentTier: string;
  agentApproved: boolean;
  profileBio: string | null;
  ninVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
};

export default function AgentProfileClient({
  user,
}: {
  user: ProfileData;
}) {
  const formattedDate = useMemo(
    () =>
      new Date(user.createdAt).toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [user.createdAt],
  );

  const mask = (v: string | null) => (v ? v.slice(0, 3) + '••••••' : 'Not provided');

  const tierColor =
    user.agentTier === 'premium'
      ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20'
      : user.agentTier === 'standard'
        ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20'
        : 'bg-[#171717] text-zinc-500 border border-white/[0.08]';

  const { data: kyc, reload } = useKycStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">My Profile</h1>
        <p className="text-base text-zinc-500 mt-1">Manage your agent account details and preferences</p>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-full border border-white/[0.08]"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#00ff66]/10 border border-white/[0.08] flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-[#00ff66]" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white text-lg">{user.fullName}</h3>
              <p className="text-xs text-zinc-500 mt-1">Agent since {formattedDate}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={tierColor}>{user.agentTier}</Badge>
                {user.agentApproved && (
                  <Badge variant="outline" className="bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20">Approved</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.08]">
              <div className="p-2 rounded-full bg-[#00ff66]/10 flex-shrink-0">
                <Mail className="h-4 w-4 text-[#00ff66]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Email</p>
                <p className="text-sm text-white mt-0.5 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.08]">
              <div className="p-2 rounded-full bg-[#00ff66]/10 flex-shrink-0">
                <Phone className="h-4 w-4 text-[#00ff66]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Phone</p>
                <p className="text-sm text-white mt-0.5">
                  {user.phone ? '••••••' : 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.08]">
              <div className="p-2 rounded-full bg-[#00ff66]/10 flex-shrink-0">
                <Shield className="h-4 w-4 text-[#00ff66]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Role</p>
                <p className="text-sm text-white mt-0.5 capitalize">{user.role}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.08]">
              <div className="p-2 rounded-full bg-[#00ff66]/10 flex-shrink-0">
                <Calendar className="h-4 w-4 text-[#00ff66]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Member Since</p>
                <p className="text-sm text-white mt-0.5">{formattedDate}</p>
              </div>
            </div>
          </div>

          {user.profileBio && (
            <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.08]">
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Bio</p>
              <p className="text-sm text-white">{user.profileBio}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="default" className="gap-2"><Pencil className="h-4 w-4" /> Edit Profile</Button>
            <Button variant="outline" className="gap-2"><Shield className="h-4 w-4" /> Verification Status</Button>
            <Button variant="outline" className="gap-2"><Phone className="h-4 w-4" /> Change Phone</Button>
          </div>
        </div>
      </div>

      <KycVerificationCard
        status={kyc?.status || 'not_started'}
        onVerified={(result) => {
          if (result.success) reload();
        }}
      />
    </div>
  );
}
