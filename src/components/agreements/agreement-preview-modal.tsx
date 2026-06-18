'use client';

import { useQuery } from '@tanstack/react-query';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgreementPreviewModalProps {
  agreementId: string;
  isOpen: boolean;
  onClose: () => void;
  onProceedToSign?: () => void;
  showSignButton?: boolean;
}

export function AgreementPreviewModal({
  agreementId,
  isOpen,
  onClose,
  onProceedToSign,
  showSignButton = false,
}: AgreementPreviewModalProps) {
  const { data: previewHtml, isLoading, error } = useQuery({
    queryKey: ['agreement-preview', agreementId],
    queryFn: async () => {
      const res = await fetch(`/api/agreements/${agreementId}/preview`);
      if (!res.ok) throw new Error('Failed to load agreement preview');
      return res.text();
    },
    enabled: isOpen && !!agreementId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle>Agreement Preview</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" style={{ height: 'calc(90vh - 180px)' }}>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">
                Failed to load agreement preview. Please try again.
              </p>
            </div>
          )}

          {previewHtml && (
            <iframe
              srcDoc={previewHtml}
              className="w-full min-h-[600px] border-0"
              title="Agreement Preview"
              sandbox="allow-same-origin"
            />
          )}
        </ScrollArea>

        {showSignButton && onProceedToSign && (
          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={onProceedToSign} className="flex-1 sm:flex-none">
                Proceed to Sign
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
