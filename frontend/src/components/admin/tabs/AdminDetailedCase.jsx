import { useState, useEffect } from 'react';
import { HiUser, HiDocumentText, HiClock, HiCheckCircle, HiXCircle, HiExclamation } from 'react-icons/hi';
import { verificationAPI, documentsAPI, reviewQueueAPI } from '../../../api/client';

export default function AdminDetailedCase({ caseId }) {
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState('');

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const [caseResponse, docsResponse] = await Promise.all([
        verificationAPI.getById(caseId),
        documentsAPI.getAll()
      ]);
      setCaseData(caseResponse.data);
      setDocuments(docsResponse.data.filter(d => d.memberProfileId === caseResponse.data.memberProfileId));
    } catch (error) {
      console.error('Failed to fetch case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (action) => {
    try {
      if (action === 'APPROVE') {
        await reviewQueueAPI.approve({ verificationRecordId: caseId, reviewNotes });
      } else if (action === 'REJECT') {
        await reviewQueueAPI.reject({ verificationRecordId: caseId, reviewNotes });
      } else if (action === 'REQUEST_DOCS') {
        await reviewQueueAPI.requestMoreDocs({ verificationRecordId: caseId, reviewNotes });
      }
      setDecision(action);
      fetchCaseDetails();
    } catch (error) {
      console.error('Failed to process decision:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading case details...</div>;
  }

  if (!caseData) {
    return <div className="text-center py-12 text-slate-600">Case not found</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-100 text-slate-700';
      case 'IN_REVIEW':
      case 'UNDER_REVIEW': return 'bg-slate-200 text-slate-800';
      case 'APPROVED': return 'bg-slate-700 text-white';
      case 'REJECTED': return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const memberName = caseData.memberProfile?.user?.name || caseData.memberProfile?.displayName || 'Unknown Member';
  const displayStatus = caseData.queueStatus || caseData.status || 'PENDING';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Case Details</h2>
          <p className="text-slate-600 mt-1">Review verification request and make decision</p>
        </div>
        <span className={`px-4 py-2 rounded-2xl text-sm font-medium ${getStatusColor(displayStatus)} w-fit`}>
          {displayStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HiUser className="text-slate-600" />
              Member Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600">Member Name</div>
                <div className="text-slate-900 font-medium truncate">{memberName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Requested Level</div>
                <div className="text-slate-900 font-semibold">{caseData.requestedLevel}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Current Level</div>
                <div className="text-slate-900">{caseData.memberProfile?.verificationLevel || 'UNVERIFIED'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Submitted</div>
                <div className="text-slate-900">{new Date(caseData.submittedAt || caseData.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HiDocumentText className="text-slate-600" />
              Submitted Documents ({documents.length})
            </h3>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-600">No documents submitted</div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <HiDocumentText className="text-2xl text-slate-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">{doc.documentType}</div>
                        <div className="text-xs text-slate-600 truncate">{doc.fileName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.reviewStatus)}`}>
                        {doc.reviewStatus}
                      </span>
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors flex-shrink-0">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Notes</h3>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter your review notes and decision rationale..."
              className="w-full h-32 p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Case Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <HiClock className="text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">Case Created</div>
                  <div className="text-xs text-slate-600">{new Date(caseData.submittedAt || caseData.createdAt).toLocaleString()}</div>
                </div>
              </div>
              {caseData.reviewedAt && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <HiCheckCircle className="text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900">Reviewed</div>
                    <div className="text-xs text-slate-600">{new Date(caseData.reviewedAt).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Decision Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDecision('APPROVE')}
                disabled={!reviewNotes || decision}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <HiCheckCircle />
                Approve Request
              </button>
              <button
                onClick={() => handleDecision('REJECT')}
                disabled={!reviewNotes || decision}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <HiXCircle />
                Reject Request
              </button>
              <button
                onClick={() => handleDecision('REQUEST_DOCS')}
                disabled={!reviewNotes || decision}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <HiExclamation />
                Request More Docs
              </button>
            </div>
          </div>

          {decision && (
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-medium text-slate-900 mb-1">Decision Recorded</div>
              <div className="text-xs text-slate-600">Your decision has been saved and the member will be notified.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
