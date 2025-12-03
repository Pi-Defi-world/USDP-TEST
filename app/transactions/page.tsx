'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { TransactionHistoryItem } from '@/types';
import { ArrowUpCircle, ArrowDownCircle, Link2, RefreshCw, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const { isAuthenticated } = usePi();
  const { walletAddress } = useWalletStore();
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!walletAddress) {
      setError('Wallet address is required to fetch transaction history');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTransactionHistory(50, walletAddress);
      
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
    if (isAuthenticated && walletAddress) {
      fetchHistory();
    }
  }, [isAuthenticated, walletAddress]);

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
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Mint</Badge>;
      case 'redeem':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Redeem</Badge>;
      case 'transfer':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Transfer</Badge>;
      case 'trustline':
        return <Badge className="bg-[#707784]/20 text-[#707784] border-[#707784]/30">Trustline</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getDirectionIcon = (direction: string | null) => {
    if (direction === 'in') {
      return <ArrowDownCircle className="h-5 w-5 text-green-400" />;
    } else if (direction === 'out') {
      return <ArrowUpCircle className="h-5 w-5 text-red-400" />;
    }
    return <FileText className="h-5 w-5 text-[#707784]" />;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
        <Card className="bg-panel border-[#1C1F25] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[#E9ECEF]">Authentication Required</CardTitle>
            <CardDescription className="text-[#707784]">
              Please connect your Pi Network wallet to view transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#707784] text-center">
              Use the &quot;Connect Pi&quot; button in the navigation bar to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
        <Card className="bg-panel border-[#1C1F25] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[#E9ECEF]">Wallet Required</CardTitle>
            <CardDescription className="text-[#707784]">
              Please import your wallet to view transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#707784] text-center mb-4">
              You need to import your wallet using the Account Service in your profile to view transaction history.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="w-full bg-gradient-blue glow-blue-hover btn-press"
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] page-transition">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] mb-2">Transactions</h1>
          <p className="text-[#707784]">Your USDP transaction history</p>
        </div>

        <Card className="bg-panel border-[#1C1F25]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-[#E9ECEF]">Transaction History</CardTitle>
              <CardDescription className="text-[#707784]">All your USDP operations</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              disabled={isLoading}
              className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && 'animate-spin')} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 mx-auto mb-4 rounded-lg skeleton-gradient" />
                <p className="text-[#707784]">Loading transaction history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchHistory}
                  className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light"
                >
                  Try Again
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-[#707784] mb-4" />
                <p className="text-[#707784] mb-2">No transactions found</p>
                <p className="text-sm text-[#707784]">
                  Your USDP transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-start justify-between p-4 rounded-lg border border-[#1C1F25] bg-panel-light hover:bg-[#16191F] transition-colors"
                  >
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="mt-1 flex-shrink-0">
                        {getDirectionIcon(tx.direction)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          {getTypeBadge(tx.type)}
                          {tx.success ? (
                            <Badge className="bg-gradient-blue text-white border-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-[#707784]/20 text-[#707784] border-[#707784]/30">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {tx.type === 'mint' && (
                            <>
                              {(tx.usdpAmount || tx.zyraAmount) && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gradient-blue">
                                    +{tx.usdpAmount || tx.zyraAmount} USDP
                                  </span>
                                </div>
                              )}
                              {tx.piAmount && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-[#707784]">
                                    -{tx.piAmount} Pi
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          {tx.type === 'redeem' && (
                            <>
                              {(tx.usdpAmount || tx.zyraAmount) && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-red-400">
                                    -{tx.usdpAmount || tx.zyraAmount} USDP
                                  </span>
                                </div>
                              )}
                              {tx.piAmount && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-[#707784]">
                                    +{tx.piAmount} Pi
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          {tx.type !== 'mint' && tx.type !== 'redeem' && (
                            <>
                              {(tx.usdpAmount || tx.zyraAmount) && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-[#E9ECEF]">
                                    {tx.direction === 'in' ? '+' : '-'}
                                    {tx.usdpAmount || tx.zyraAmount} USDP
                                  </span>
                                </div>
                              )}
                              {tx.piAmount && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-[#707784]">
                                    {tx.direction === 'in' ? '+' : '-'}
                                    {tx.piAmount} Pi
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="text-xs text-[#707784]">
                            {formatDate(tx.createdAt)}
                          </div>
                          {tx.memo && (
                            <div className="text-xs text-[#707784] italic">
                              {tx.memo}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0">
                      <a
                        href={`https://blockexplorer.minepi.com/testnet/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gradient-blue hover:text-blue-400 flex items-center space-x-1 transition-colors"
                      >
                        <Link2 className="h-3 w-3" />
                        <span>View</span>
                      </a>
                      <div className="text-xs text-[#707784] space-y-1 text-right">
                        {(tx.usdpFee || tx.zyraFee) && (
                          <div>
                            Fee: {tx.usdpFee || tx.zyraFee} USDP
                          </div>
                        )}
                        <div>
                          Network: {tx.feeInTestnetPi ? `${tx.feeInTestnetPi} Test-Pi` : `${tx.fee} Pi`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

