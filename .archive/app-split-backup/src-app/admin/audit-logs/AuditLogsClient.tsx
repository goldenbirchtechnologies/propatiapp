'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  details: string | number | boolean | object | null;
  timestamp: Date;
}

interface AuditLogsClientProps {
  auditLogs: AuditLog[];
}

export default function AuditLogsClient({ auditLogs: initialLogs }: AuditLogsClientProps) {
  const { toast } = useToast();
  const [logs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        typeof log.details === "string"
          ? typeof log.details === "string"
            ? log.details.toLowerCase().includes(searchTerm.toLowerCase())
            : String(log.details).toLowerCase().includes(searchTerm.toLowerCase())
          : String(log.details).includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;

      const logDate = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
      const matchesStart = !startDate || logDate >= new Date(startDate);
      const matchesEnd = !endDate || logDate <= new Date(endDate + 'T23:59:59');

      return matchesSearch && matchesAction && matchesStart && matchesEnd;
    });
  }, [logs, searchTerm, actionFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const csvData = [
      ['Admin', 'Action', 'Target', 'Details', 'Timestamp'],
      ...filteredLogs.map((log) => [
        log.admin,
        log.action,
        log.target,
        typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
        log.timestamp instanceof Date ? log.timestamp.toISOString() : new Date(log.timestamp).toISOString(),
      ]),
    ];

    const csvContent = csvData.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Success', description: 'Audit logs exported as CSV' });
  };

  const handleExportMockJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      dateRange: { start: startDate || null, end: endDate || null },
      filters: { action: actionFilter, search: searchTerm || null },
      total: filteredLogs.length,
      logs: filteredLogs.map((log) => ({
        id: log.id,
        admin: log.admin,
        action: log.action,
        target: log.target,
        details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
        timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : new Date(log.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Success', description: 'Audit logs exported as JSON' });
  };

  const getActionColor = (action: string) => {
    if (action.includes('Suspended') || action.includes('Rejected') || action.includes('Banned')) {
      return 'tag-red';
    } else if (action.includes('Approved') || action.includes('Verified') || action.includes('Activated')) {
      return 'tag-green';
    } else if (action.includes('Changed') || action.includes('Updated')) {
      return 'tag-blue';
    }
    return 'tag-gray';
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const actionTypes = [...new Set(logs.map((log) => log.action))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            Audit Logs
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Track all admin actions and platform activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportMockJSON} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--muted)' }}
              />
              <Input
                placeholder="Search by admin, action, target, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
                placeholder="Start date"
              />
            </div>
            <span style={{ color: 'var(--muted)' }}>–</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
                placeholder="End date"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card">
        {paginatedLogs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Admin
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Action
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Target
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Details
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                          >
                            {log.admin.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--text)' }}>
                            {log.admin}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`tag ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4" style={{ color: 'var(--text)' }}>
                        {log.target}
                      </td>
                      <td className="p-4">
                        <p className="text-sm max-w-md" style={{ color: 'var(--muted)' }}>
                          {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm" style={{ color: 'var(--text)' }}>
                          {formatTimestamp(log.timestamp)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}{' '}
                  logs
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
              No audit logs found
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
