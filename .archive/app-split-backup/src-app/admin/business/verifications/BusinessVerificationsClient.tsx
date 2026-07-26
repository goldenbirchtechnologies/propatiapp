'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type BusinessVerification = {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  cacNumber: string;
  companyName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  documents: unknown;
  submittedAt: Date | string;
  reviewedAt: Date | null;
  adminNotes: string | null;
};

interface BusinessVerificationsClientProps {
  verifications: BusinessVerification[];
}

export default function BusinessVerificationsClient({
  verifications: initialVerifications,
}: BusinessVerificationsClientProps) {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<BusinessVerification[]>(initialVerifications);
  const [selectedVerification, setSelectedVerification] = useState<BusinessVerification | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = (verification: BusinessVerification, actionType: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setAction(actionType);
    setNotes('');
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedVerification || !action) return;

    if (action === 'reject' && notes.trim().length < 10) {
      toast({
        title: 'Validation Error',
        description: 'Rejection reason must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = `/api/admin/business/verifications/${selectedVerification.id}/${action}`;
      const body = action === 'approve' ? { notes } : { reason: notes };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} verification`);
      }

      toast({
        title: 'Success',
        description: `Business CAC verification ${action}d successfully`,
      });
      setVerifications((prev) => prev.filter((v) => v.id !== selectedVerification.id));
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} verification`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'tag-green';
      case 'rejected':
        return 'tag-red';
      default:
        return 'tag-amber';
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'law_firm':
        return 'Law Firm';
      case 'organisation':
        return 'Estate Manager Org';
      case 'business_profile':
        return 'Business Profile';
      default:
        return type;
    }
  };

  const renderDocuments = (documents: unknown) => {
    if (!documents || typeof documents !== 'object' || !Array.isArray(documents)) {
      return <span className="text-sm" style={{ color: 'var(--muted)' }}>No documents</span>;
    }
    return (
      <ul className="text-sm space-y-1">
        {(documents as Array<{ name?: string; url?: string }>).map((doc, idx) => (
          <li key={idx}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: 'var(--link)' }}
            >
              {doc.name || `Document ${idx + 1}`}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="font-heading font-bold"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
        >
          Business CAC Verifications
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Review and verify CAC registration for law firms and estate manager organisations.
        </p>
      </div>

      <div className="card">
        {verifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
              No pending CAC verifications
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
              All business verifications have been reviewed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Entity
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    CAC Number
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Company Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Contact
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Documents
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Submitted
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((verification) => (
                  <tr key={verification.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {getEntityLabel(verification.entityType)}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          ID: {verification.entityId}
                        </p>
                      </div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--text)' }}>
                      {verification.cacNumber}
                    </td>
                    <td className="p-4" style={{ color: 'var(--text)' }}>
                      {verification.companyName || '—'}
                    </td>
                    <td className="p-4">
                      <div className="text-sm" style={{ color: 'var(--text)' }}>
                        {verification.contactEmail || '—'}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        {verification.contactPhone || '—'}
                      </div>
                    </td>
                    <td className="p-4">{renderDocuments(verification.documents)}</td>
                    <td className="p-4" style={{ color: 'var(--text)' }}>
                      {new Date(verification.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(verification.status)}>
                        {verification.status}
                      </Badge>
                    </td>
                    <td className="p-4 flex gap-2">
                      <Button
                        onClick={() => handleAction(verification, 'approve')}
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(verification, 'reject')}
                        size="sm"
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-elevated p-6 rounded-lg space-y-4 w-full max-w-md">
            <h2 className="text-lg font-semibold">
              {action === 'approve' ? 'Approve' : 'Reject'} Business CAC Verification
            </h2>
            <div className="text-sm space-y-1" style={{ color: 'var(--text)' }}>
              <p>
                <strong>CAC:</strong> {selectedVerification?.cacNumber}
              </p>
              <p>
                <strong>Company:</strong> {selectedVerification?.companyName || '—'}
              </p>
              <p>
                <strong>Entity:</strong> {selectedVerification?.entityType} ({selectedVerification?.entityId})
              </p>
            </div>
            <textarea
              className="w-full rounded border p-2 h-24"
              placeholder={action === 'approve' ? 'Notes (optional)' : 'Reason (min 10 characters)'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={isSubmitting}
                variant={action === 'approve' ? 'default' : 'destructive'}
              >
                {isSubmitting ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
