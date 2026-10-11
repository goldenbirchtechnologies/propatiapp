'use client';

function WithdrawalsClient({
  stats,
  transactions,
}: {
  stats: {
    releasedAmount: number;
    escrowedAmount: number;
    feeTotal: number;
    totalWallet: number;
    walletCount: number;
    releasedTxCount: number;
  };
  transactions: {
    id: string;
    reference: string | null;
    status: string;
    type: string;
    amount: number;
    platformFee: number;
    currency: string | null;
    createdAt: Date;
    payer: { fullName: string; email: string } | null;
    payee: { fullName: string; email: string } | null;
  }[];
}) {
  const formatKobo = (val: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val / 100);

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const statusClass = (s: string) => {
    switch (s) {
      case 'released':
        return 'bg-emerald-600 text-on-success';
      case 'in_escrow':
        return 'bg-secondary-container text-on-secondary-container';
      case 'pending':
        return 'bg-outline-variant text-zinc-900 dark:text-white';
      case 'failed':
        return 'bg-error/10 text-error';
      default:
        return 'bg-outline-variant/30 text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-zinc-900 dark:text-white tracking-tight">
          Withdrawals &amp; Financials
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-body-md mt-1">
          Platform payouts, escrow balances, and wallet overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Withdrawn / Released',
            value: formatKobo(stats.releasedAmount),
            sub: `${stats.releasedTxCount.toLocaleString()} transactions`,
          },
          {
            label: 'In Escrow Balance',
            value: formatKobo(stats.escrowedAmount),
            sub: 'Held in escrow',
          },
          {
            label: 'Platform Fee Revenue',
            value: formatKobo(stats.feeTotal),
            sub: 'Net collected',
          },
          {
            label: 'Total Wallet Holdings',
            value: formatKobo(stats.totalWallet),
            sub: `${stats.walletCount.toLocaleString()} wallets registered`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] bg-surface p-lg shadow-none"
          >
            <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-2">{card.label}</div>
            <div className="font-headline-md text-headline-md text-zinc-900 dark:text-white leading-tight">{card.value}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction Feed */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] bg-surface shadow-none overflow-hidden">
        <div className="p-md border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-md bg-white dark:bg-white dark:bg-zinc-950">
          <h3 className="text-zinc-900 dark:text-white text-zinc-900 dark:text-white">Recent Transactions</h3>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Showing {transactions.length} most recent
          </span>
        </div>
        {transactions.length === 0 ? (
          <p className="p-lg text-sm text-zinc-600 dark:text-zinc-400 text-center">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08]">
                  {['ID', 'Type', 'Amount', 'Fee', 'Payer', 'Payee', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-md py-3 text-xs text-label-sm text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900 transition-colors">
                    <td className="px-md py-4 font-label-sm text-label-sm text-zinc-900 dark:text-white whitespace-nowrap">
                      {tx.reference || tx.id.slice(0, 12)}
                    </td>
                    <td className="px-md py-4 text-body-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                    <td className="px-md py-4 font-bold text-zinc-900 dark:text-white text-body-sm whitespace-nowrap">
                      {formatKobo(tx.amount)}
                    </td>
                    <td className="px-md py-4 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {tx.platformFee > 0 ? formatKobo(tx.platformFee) : '—'}
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container shrink-0">
                          {initials(tx.payer?.fullName || '??')}
                        </div>
                        <span className="text-body-sm truncate max-w-[140px]">{tx.payer?.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-tertiary-container flex items-center justify-center text-[10px] font-bold shrink-0">
                          {initials(tx.payee?.fullName || '??')}
                        </div>
                        <span className="text-body-sm truncate max-w-[140px]">{tx.payee?.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-md py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider ${statusClass(tx.status)}`}
                      >
                        {tx.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
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
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {transactions.length} records shown
          </p>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Kibo-based aggregation (kobo units)</span>
        </div>
      </div>
    </div>
  );
}

export default WithdrawalsClient;