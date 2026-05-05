import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function AureonGovernance() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [upgradeRequest, setUpgradeRequest] = useState({ requestedTierId: '', evidenceLink: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [memberRes, tiersRes] = await Promise.all([
        apiClient.get(`/aureon/member/${auth?.memberProfileId}`),
        apiClient.get('/aureon/tiers'),
      ]);
      setMember(memberRes.data);
      setTiers(tiersRes.data);
    } catch (err) {
      setError('Failed to load governance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!upgradeRequest.requestedTierId || !upgradeRequest.evidenceLink) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/aureon/upgrade-request', {
        memberId: member.id,
        requestedTierId: parseInt(upgradeRequest.requestedTierId),
        evidenceLink: upgradeRequest.evidenceLink,
        description: upgradeRequest.description,
      });
      setSuccess('Upgrade request submitted successfully');
      setUpgradeRequest({ requestedTierId: '', evidenceLink: '', description: '' });
      setTimeout(() => loadData(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit upgrade request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading governance data...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load member data</AlertDescription>
      </Alert>
    );
  }

  const currentTier = tiers.find((t) => t.id === member.tierId);
  const nextTiers = tiers.filter((t) => t.id > member.tierId);

  return (
    <div className="space-y-6">
      {/* Current Tier Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your AUREON9 Tier</CardTitle>
          <CardDescription>Membership level and benefits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Current Tier</p>
              <Badge className="text-lg py-2">{currentTier?.name || 'N/A'}</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Tier Multiplier</p>
              <p className="font-semibold">{currentTier?.multiplier || '0.0'}x</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Base Units</p>
              <p className="font-semibold">{member.baseUnits || '0'}</p>
            </div>
          </div>

          {currentTier && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium text-blue-900">Tier Benefits:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                {currentTier.marketplaceAccess && <li>Marketplace Access: {currentTier.marketplaceAccess}</li>}
                {currentTier.governanceAccess && <li>Governance Access: {currentTier.governanceAccess}</li>}
                {currentTier.capitalAccess && <li>Capital Access: {currentTier.capitalAccess}</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Request Form */}
      {nextTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request Tier Upgrade</CardTitle>
            <CardDescription>Apply to upgrade to a higher tier</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpgradeRequest} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Request Upgrade to Tier
                </label>
                <select
                  value={upgradeRequest.requestedTierId}
                  onChange={(e) =>
                    setUpgradeRequest({ ...upgradeRequest, requestedTierId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  disabled={submitting}
                >
                  <option value="">Select a tier</option>
                  {nextTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} ({tier.multiplier}x multiplier)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Evidence Link (Required)
                </label>
                <Input
                  value={upgradeRequest.evidenceLink}
                  onChange={(e) =>
                    setUpgradeRequest({ ...upgradeRequest, evidenceLink: e.target.value })
                  }
                  placeholder="https://example.com/evidence"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={upgradeRequest.description}
                  onChange={(e) =>
                    setUpgradeRequest({ ...upgradeRequest, description: e.target.value })
                  }
                  placeholder="Explain why you deserve this upgrade..."
                  rows={3}
                  disabled={submitting}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Upgrade Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tier Progression */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Progression</CardTitle>
          <CardDescription>View all available tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-4 rounded-lg border-2 transition ${
                  tier.id === member.tierId
                    ? 'border-[var(--aureon-ink)] bg-blue-50'
                    : 'border-slate-200'
                }`}
              >
                <p className="font-semibold">{tier.name}</p>
                <p className="text-sm text-slate-600">{tier.multiplier}x multiplier</p>
                {tier.id === member.tierId && (
                  <Badge className="mt-2 bg-[var(--aureon-ink)]">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Status</p>
              <Badge variant={member.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {member.status}
              </Badge>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Verification Level</p>
              <p className="font-medium">{member.verificationLevel.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Certification Level</p>
              <p className="font-medium">Level {member.certificationLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
