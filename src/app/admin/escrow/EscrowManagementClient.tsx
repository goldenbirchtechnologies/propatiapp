'use client'

import AppIcon from '@/components/icons/app-icon';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {

  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Lock, Unlock, Filter } from 'lucide-react';
import { useTransactions } from '@/hooks/usePayments';
import { formatAmountFromKobo, formatTransactionReference } from '@/lib/payment-utils';
import { useToast } from '@/hooks/use-toast';

export default function EscrowManagementClient() {
  const { toast } = useToast();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<unknown>(null);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
  });
  const [isReleasing, setIsReleasing] = useState(false);

  // Fetch only transactions in escrow
  const { data: transactionsData, isLoading, refetch } = useTransactions({ status: 'in_escrow' } as unknown) as unknown;

  const transactions = transactionsData?.pages?.flatMap((page: unknown) => page.data || []) || [];

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map((tx: unknown) => tx.id));
    }
  };

  const handleOpenReleaseModal = (transaction: unknown) => {
    setCurrentTransaction(transaction);
    // Pre-fill payee bank details if available
    if (transaction.payee?.bankAccount) {
      setBankDetails({
        accountName: transaction.payee.bankAccount.accountName || '',
        accountNumber: transaction.payee.bankAccount.accountNumber || '',
        bankName: transaction.payee.bankAccount.bankName || '',
      });
    }
    setReleaseModalOpen(true);
  };

  const handleProceedToConfirm = () => {
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      toast({
        title: 'Incomplete Information',
        description: 'Please provide all bank details',
        variant: 'destructive',
      });
      return;
    }
    setReleaseModalOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleReleaseEscrow = async () => {
    setIsReleasing(true);

    try {
      const response = await fetch(`/api/payments/release-escrow/${currentTransaction.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: bankDetails.accountName,
          accountNumber: bankDetails.accountNumber,
          bankCode: bankDetails.bankName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to release escrow');
      }

      toast({
        title: 'Escrow Released',
        description: `Payment released to ${currentTransaction.payee?.fullName}`,
      });

      // Reset state
      setCurrentTransaction(null);
      setBankDetails({ accountName: '', accountNumber: '', bankName: '' });
      setConfirmDialogOpen(false);

      // Refetch transactions
      refetch();
    } catch (error) {
      toast({
        title: 'Release Failed',
        description: 'Unable to release escrow. Please try again.',
        variant: 'destructive',
      });
      console.error('Escrow release error:', error);
    } finally {
      setIsReleasing(false);
    }
  };

  const handleBulkRelease = () => {
    toast({
      title: 'Bulk Release',
      description: 'Bulk release feature coming soon',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-muted-foreground">
            Manage and release payments held in escrow
          </p>
        </div>
        {selectedTransactions.length > 0 && (
          <Button onClick={handleBulkRelease}>
            <Unlock className="mr-2 h-4 w-4" />
            Release {selectedTransactions.length} Selected
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Escrow</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">transactions pending release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmountFromKobo(
                transactions.reduce((sum: number, tx: unknown) => sum + Number(tx.amount), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">held in escrow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Unlock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedTransactions.length}</div>
            <p className="text-xs text-muted-foreground">transactions selected</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions in Escrow</CardTitle>
          <CardDescription>
            Review and release payments to landlords/sellers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Transactions in Escrow</h3>
              <p className="text-muted-foreground">
                All payments have been released or there are no pending transactions
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTransactions.length === transactions.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Payee Gets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: unknown) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(tx.id)}
                          onCheckedChange={() => handleSelectTransaction(tx.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {formatTransactionReference(tx.reference)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.payer?.fullName}</p>
                          <p className="text-xs text-muted-foreground">{tx.payer?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.payee?.fullName}</p>
                          <p className="text-xs text-muted-foreground">{tx.payee?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatAmountFromKobo(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatAmountFromKobo(tx.payeeAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenReleaseModal(tx)}
                        >
                          <Unlock className="mr-2 h-4 w-4" />
                          Release
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Release Modal */}
      <Dialog open={releaseModalOpen} onOpenChange={setReleaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Escrow Payment</DialogTitle>
            <DialogDescription>
              Enter the bank details to release the payment to the landlord/seller
            </DialogDescription>
          </DialogHeader>

          {currentTransaction && (
            <div className="space-y-4 py-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Releasing to</p>
                <p className="font-semibold">{currentTransaction.payee?.fullName}</p>
                <p className="text-sm text-muted-foreground">{currentTransaction.payee?.email}</p>
                <p className="text-lg font-bold mt-2 text-green-600">
                  {formatAmountFromKobo(currentTransaction.payeeAmount)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    placeholder="Enter account name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProceedToConfirm}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Escrow Release</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release this payment? This action cannot be undone.
              The funds will be transferred to the provided bank account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {currentTransaction && (
            <div className="bg-muted rounded-lg p-4 my-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">{formatAmountFromKobo(currentTransaction.payeeAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-semibold">{bankDetails.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="font-mono">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <AppIcon name={bankDetails.bankName} className="lucide" />
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReleasing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseEscrow} disabled={isReleasing}>
              {isReleasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Releasing...
                </>
              ) : (
                'Confirm Release'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
