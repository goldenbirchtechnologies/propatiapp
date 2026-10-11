'use client';

import { AlertTriangle } from 'lucide-react';

function EscrowClient({
  stats,
  escrowed,
  disputed,
}: {
  stats: {
    gtv: number;
    escrowCount: number;
    escrowBalance: number;
    disputeCount: number;
    disputeBalance: number;
    pendingSettlements: number;
  };
  escrowed: {
    id: string;
    reference: string | null;
    status: string;
    type: string;
    amount: number;
    currency: string | null;
    createdAt: Date;
    listingId: string | null;
    payer: { fullName: string } | null;
    payee: { fullName: string } | null;
  }[];
  disputed: {
    id: string;
    reference: string | null;
    status: string;
    type: string;
    amount: number;
    currency: string | null;
    createdAt: Date;
    listingId: string | null;
    payer: { fullName: string } | null;
    payee: { fullName: string } | null;
  }[];
}) {
  const formatKobo = (val: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-zinc-900 dark:text-white tracking-tight">
            Escrow Transactions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-body-md mt-1">
            Monitor platform GTV, escrow security, and financial integrity.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Platform GTV',
            value: formatKobo(stats.gtv),
            sub: 'Released + In Escrow',
          },
          {
            label: 'Active Escrow Balance',
            value: formatKobo(stats.escrowBalance),
            sub: `${stats.escrowCount.toLocaleString()} transactions`,
          },
          {
            label: 'Pending Settlements',
            value: `${stats.pendingSettlements.toLocaleString()}`,
            sub: 'Expecting release',
          },
          {
            label: 'Flagged / Disputed',
            value: `${stats.disputeCount.toLocaleString()} (${formatKobo(stats.disputeBalance)})`,
            sub: 'Requires review',
            danger: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border shadow-none p-lg ${
              card.danger
                ? 'border-error/20 bg-error/5'
                : 'border-zinc-200 dark:border-white/[0.08] bg-surface'
            }`}
          >
            <div
              className={`text-sm font-medium mb-2 ${card.danger ? 'text-error' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400'}`}
            >
              {card.label}
            </div>
            <div
              className={`font-headline-md text-headline-md ${card.danger ? 'text-error' : 'text-zinc-900 dark:text-white'}`}
            >
              {card.value}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Escrowed Transactions */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-surface shadow-none overflow-hidden">
        <div className="p-md border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-zinc-950">
          <h3 className="text-zinc-900 dark:text-white text-zinc-900 dark:text-white">Active Escrow Transactions</h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">
            {escrowed.length} records
          </span>
        </div>
        {escrowed.length === 0 ? (
          <p className="p-lg text-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 text-center">No transactions currently in escrow.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/[0.08]">
                  {['ID', 'Type', 'Amount', 'Payer', 'Payee', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-md py-3 text-xs text-label-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {escrowed.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white dark:bg-zinc-900 transition-colors">
                    <td className="px-md py-4 font-label-sm text-label-sm text-zinc-900 dark:text-white whitespace-nowrap">
                      {tx.reference || tx.id.slice(0, 12)}
                    </td>
                    <td className="px-md py-4 text-body-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                    <td className="px-md py-4 font-bold text-zinc-900 dark:text-white text-body-sm whitespace-nowrap">
                      {formatKobo(tx.amount)}
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">{tx.payer?.fullName || '—'}</td>
                    <td className="px-md py-4 text-body-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">{tx.payee?.fullName || '—'}</td>
                    <td className="px-md py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                        {tx.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {tx.createdAt.toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disputed / Flagged */}
      {disputed.length > 0 && (
        <div className="rounded-xl border-2 border-error/20 bg-error/5 shadow-none overflow-hidden">
          <div className="p-md border-b border-error/20 flex items-center gap-2">
            <AlertTriangle className="text-error" />
            <h3 className="text-zinc-900 dark:text-white text-error">Disputed Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-error/10">
                  {['ID', 'Type', 'Amount', 'Payer', 'Payee', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-md py-3 text-xs text-label-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-error/10">
                {disputed.map((tx) => (
                  <tr key={tx.id} className="hover:bg-error/5 transition-colors">
                    <td className="px-md py-4 font-label-sm text-label-sm text-error whitespace-nowrap">
                      {tx.reference || tx.id.slice(0, 12)}
                    </td>
                    <td className="px-md py-4 text-body-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                    <td className="px-md py-4 font-bold text-error text-body-sm whitespace-nowrap">
                      {formatKobo(tx.amount)}
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">{tx.payer?.fullName || '—'}</td>
                    <td className="px-md py-4 text-body-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">{tx.payee?.fullName || '—'}</td>
                    <td className="px-md py-4 text-body-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {tx.createdAt.toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EscrowClient;