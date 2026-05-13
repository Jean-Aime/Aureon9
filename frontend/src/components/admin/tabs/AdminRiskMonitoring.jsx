import { useState, useEffect } from 'react';
import { HiShieldExclamation, HiExclamation, HiCheckCircle, HiClock, HiUser } from 'react-icons/hi';
import { verificationAPI, membersAPI, documentsAPI } from '../../../api/client';

export default function AdminRiskMonitoring() {
  const [riskCases, setRiskCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const [verificationsResponse, membersResponse, documentsResponse] = await Promise.all([
        verificationAPI.getAll(),
        membersAPI.getAll(),
        documentsAPI.getAll()
      ]);

      const verifications = verificationsResponse.data || [];
      const members = membersResponse.data || [];
      const documents = documentsResponse.data || [];

      const risks = [];

      verifications.forEach(verification => {
        const member = members.find(m => m.id === verification.memberProfileId);
        const memberName = member?.user?.name || member?.displayName || 'Unknown';
        const memberEmail = member?.user?.email || 'N/A';

        if (verification.status === 'REJECTED' || verification.queueStatus === 'REJECTED') {
          risks.push({
            id: `risk-${verification.id}`,
            type: 'VERIFICATION_REJECTED',
            severity: 'HIGH',
            memberName,
            memberEmail,
            description: `Verification request rejected for ${verification.requestedLevel}`,
            detectedAt: verification.reviewedAt || verification.createdAt,
            status: 'ACTIVE'
          });
        }

        if (verification.status === 'PENDING' || verification.queueStatus === 'PENDING') {
          const daysPending = (Date.now() - new Date(verification.submittedAt || verification.createdAt)) / (1000 * 60 * 60 * 24);
          if (daysPending > 7) {
            risks.push({
              id: `risk-pending-${verification.id}`,
              type: 'VERIFICATION_DELAYED',
              severity: 'MEDIUM',
              memberName,
              memberEmail,
              description: `Verification pending for ${Math.floor(daysPending)} days`,
              detectedAt: verification.submittedAt || verification.createdAt,
              status: 'ACTIVE'
            });
          }
        }
      });

      documents.forEach(doc => {
        if (doc.reviewStatus === 'REJECTED') {
          const member = members.find(m => m.id === doc.memberProfileId);
          const memberName = member?.user?.name || member?.displayName || 'Unknown';
          const memberEmail = member?.user?.email || 'N/A';
          
          risks.push({
            id: `risk-doc-${doc.id}`,
            type: 'DOCUMENT_REJECTED',
            severity: 'MEDIUM',
            memberName,
            memberEmail,
            description: `Document rejected: ${doc.documentType}`,
            detectedAt: doc.reviewedAt || doc.uploadedAt,
            status: 'ACTIVE'
          });
        }

        if (doc.reviewStatus === 'EXPIRED') {
          const member = members.find(m => m.id === doc.memberProfileId);
          const memberName = member?.user?.name || member?.displayName || 'Unknown';
          const memberEmail = member?.user?.email || 'N/A';
          
          risks.push({
            id: `risk-exp-${doc.id}`,
            type: 'DOCUMENT_EXPIRED',
            severity: 'LOW',
            memberName,
            memberEmail,
            description: `Document expired: ${doc.documentType}`,
            detectedAt: doc.expiryDate || doc.uploadedAt,
            status: 'ACTIVE'
          });
        }
      });

      setRiskCases(risks.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt)));
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
      setRiskCases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = severityFilter === 'ALL' 
    ? riskCases 
    : riskCases.filter(c => c.severity === severityFilter);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'bg-slate-800 text-white';
      case 'MEDIUM': return 'bg-slate-600 text-white';
      case 'LOW': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'VERIFICATION_REJECTED': return 'bg-slate-700 text-white';
      case 'DOCUMENT_REJECTED': return 'bg-slate-600 text-white';
      case 'VERIFICATION_DELAYED': return 'bg-slate-500 text-white';
      case 'DOCUMENT_EXPIRED': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Risk Monitoring</h2>
          <p className="text-slate-600 mt-1">Monitor and manage compliance risk cases</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto">
          <HiShieldExclamation className="inline mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiShieldExclamation className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{riskCases.length}</div>
              <div className="text-sm text-slate-600">Total Risks</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiExclamation className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {riskCases.filter(r => r.severity === 'HIGH').length}
              </div>
              <div className="text-sm text-slate-600">High Severity</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {riskCases.filter(r => r.severity === 'MEDIUM').length}
              </div>
              <div className="text-sm text-slate-600">Medium Severity</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {riskCases.filter(r => r.severity === 'LOW').length}
              </div>
              <div className="text-sm text-slate-600">Low Severity</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Active Risk Cases</h3>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
          >
            <option value="ALL">All Severity</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading risk cases...</div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No risk cases found</div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((risk) => (
              <div key={risk.id} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <HiShieldExclamation className="text-3xl text-slate-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)} flex-shrink-0`}>
                          {risk.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(risk.type)} flex-shrink-0`}>
                          {risk.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">{risk.description}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <HiUser className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{risk.memberName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HiClock className="text-slate-400 flex-shrink-0" />
                          {new Date(risk.detectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                      Investigate
                    </button>
                    <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-sm text-slate-600 mb-1">Verification Issues</div>
            <div className="text-2xl font-bold text-slate-900">
              {riskCases.filter(r => r.type.includes('VERIFICATION')).length}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-sm text-slate-600 mb-1">Document Issues</div>
            <div className="text-2xl font-bold text-slate-900">
              {riskCases.filter(r => r.type.includes('DOCUMENT')).length}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-sm text-slate-600 mb-1">Active Cases</div>
            <div className="text-2xl font-bold text-slate-900">
              {riskCases.filter(r => r.status === 'ACTIVE').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
