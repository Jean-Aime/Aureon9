import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function WalletAndDistributions() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, distRes] = await Promise.all([
        apiClient.get(`/wallet/${auth?.memberProfileId}`),
        apiClient.get(`/api/member-distributions/${auth?.memberProfileId}`).catch(() => ({ data: [] })),
      ]);
      setWalletData(walletRes.data);
      setDistributions(distRes.data);
    } catch (err) {
      setError('Failed to load wallet data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading wallet data...</div>
      </div>
    );
  }

  const balance = walletData?.reduce((sum, entry) => {
    if (entry.creditType === 'EARNED_ARX' && entry.vestingStatus === 'IMMEDIATE') {
      return sum + (entry.amount || 0);
    }
    return sum;
  }, 0) || 0;

  const locked = walletData?.reduce((sum, entry) => {
    if (entry.vestingStatus === 'LOCKED') {
      return sum + (entry.amount || 0);
    }
    return sum;
  }, 0) || 0;

  const vested = walletData?.reduce((sum, entry) => {
    if (entry.vestingStatus === 'RELEASED') {
      return sum + (entry.amount || 0);
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--aureon-ink)]">{balance.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">AUREX (ARX)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Locked Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{locked.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Vesting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Vested Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{vested.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Released</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Activity</CardTitle>
          <CardDescription>Recent transactions and credits</CardDescription>
        </CardHeader>
        <CardContent>
          {walletData && walletData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {walletData.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-2">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2 font-medium">{entry.creditType.replace(/_/g, ' ')}</td>
                      <td className="py-2 px-2 font-semibold">{entry.amount?.toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <Badge
                          variant={
                            entry.vestingStatus === 'IMMEDIATE'
                              ? 'success'
                              : entry.vestingStatus === 'LOCKED'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {entry.vestingStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No wallet activity yet</p>
          )}
        </CardContent>
      </Card>

      {/* Distributions */}
      {distributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pool Distributions</CardTitle>
            <CardDescription>Your earnings from pool distributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distributions.map((dist) => (
                <div key={dist.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{dist.poolType} Pool</p>
                    <p className="text-sm text-slate-600">
                      {new Date(dist.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-lg">{dist.amount?.toFixed(2)} ARX</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
