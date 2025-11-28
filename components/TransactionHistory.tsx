'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { TransactionHistoryItem } from '@/types';
import { ArrowUpCircle, ArrowDownCircle, Link2, RefreshCw, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionHistoryProps {
  walletAddress?: string;
}

export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!walletAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTransactionHistory(50);
      
      if (response.success && response.data) {
        const data = response.data as { transactions: TransactionHistoryItem[]; count: number };
        setTransactions(data.transactions || []);
      } else {
        setError(response.error || 'Failed to fetch transaction history');
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'mint':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Mint</Badge>;
      case 'redeem':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Redeem</Badge>;
      case 'transfer':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Transfer</Badge>;
      case 'trustline':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Trustline</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getDirectionIcon = (direction: string | null) => {
    if (direction === 'in') {
      return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
    } else if (direction === 'out') {
      return <ArrowUpCircle className="h-4 w-4 text-red-600" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  if (!walletAddress) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your USDP transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please connect your wallet to view transaction history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your USDP transaction history</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading transaction history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your USDP transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getDirectionIcon(tx.direction)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeBadge(tx.type)}
                      {tx.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      {tx.type === 'mint' && (
                        <>
                          {(tx.usdpAmount || (tx as any).zyraAmount) && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-green-600">
                                +{tx.usdpAmount || (tx as any).zyraAmount} USDP
                              </span>
                            </div>
                          )}
                          {tx.piAmount && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                -{tx.piAmount} Pi
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {tx.type === 'redeem' && (
                        <>
                          {(tx.usdpAmount || (tx as any).zyraAmount) && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-red-600">
                                -{tx.usdpAmount || (tx as any).zyraAmount} USDP
                              </span>
                            </div>
                          )}
                          {tx.piAmount && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                +{tx.piAmount} Pi
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {tx.type !== 'mint' && tx.type !== 'redeem' && (
                        <>
                          {(tx.usdpAmount || (tx as any).zyraAmount) && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {tx.direction === 'in' ? '+' : '-'}
                                {tx.usdpAmount || (tx as any).zyraAmount} USDP
                              </span>
                            </div>
                          )}
                          {tx.piAmount && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {tx.direction === 'in' ? '+' : '-'}
                                {tx.piAmount} Pi
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </div>
                      {tx.memo && (
                        <div className="text-xs text-muted-foreground italic">
                          {tx.memo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <a
                    href={`https://blockexplorer.minepi.com/testnet/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Link2 className="h-3 w-3" />
                    <span>View</span>
                  </a>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {(tx.usdpFee || (tx as any).zyraFee) && (
                      <div>
                        USDP Fee: {tx.usdpFee || (tx as any).zyraFee} USDP
                      </div>
                    )}
                    <div>
                      Network Fee: {tx.feeInTestnetPi ? `${tx.feeInTestnetPi} Test-Pi` : `${tx.fee} Pi`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

