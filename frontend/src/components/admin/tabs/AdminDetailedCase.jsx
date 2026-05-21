import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiUser, HiDocumentText, HiClock, HiCheckCircle, HiXCircle, HiExclamation, HiArrowLeft } from 'react-icons/hi';
import { verificationAPI, documentsAPI, reviewQueueAPI } from '../../../api/client';

export default function AdminDetailedCase() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState('');

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    } else {
      setLoading(false);
    }
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const caseResponse = await verificationAPI.getById(caseId);
      const docsResponse = await documentsAPI.getAll();
      setCaseData(caseResponse.data);
      setDocuments(docsResponse.data.filter(d => d.memberProfileId === caseResponse.data.memberProfileId));
    } catch (error) {
      console.error('Failed to fetch case details:', error);
      setCaseData(null);
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

  if (!caseId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <HiDocumentText className="mx-auto text-6xl text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Case Selected</h3>
        <p className="text-slate-600 mb-4">Please select a case from the Review Queue to view details</p>
        <button
          onClick={() => navigate('/dashboard/admin/review-queue')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors inline-flex items-center gap-2"
        >
          <HiArrowLeft />
          Go to Review Queue
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading case details...</div>;
  }

  if (!caseData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <HiExclamation className="mx-auto text-6xl text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Case Not Found</h3>
        <p className="text-slate-600 mb-4">This case doesn't exist or has been removed</p>
        <button
          onClick={() => navigate('/dashboard/admin/review-queue')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors inline-flex items-center gap-2"
        >
          <HiArrowLeft />
          Go to Review Queue
        </button>
      </div>
    );
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/admin/review-queue')}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
            title="Back to Review Queue"
          >
            <HiArrowLeft className="text-xl text-slate-700" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Review Case</h2>
            <p className="text-slate-600 mt-1">Look at documents and decide</p>
          </div>
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
              Person Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600">Name</div>
                <div className="text-slate-900 font-medium truncate">{memberName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Wants</div>
                <div className="text-slate-900 font-semibold">{caseData.requestedLevel}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Current Status</div>
                <div className="text-slate-900">{caseData.memberProfile?.verificationLevel || 'UNVERIFIED'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Sent On</div>
                <div className="text-slate-900">{new Date(caseData.submittedAt || caseData.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HiDocumentText className="text-slate-600" />
              Documents ({documents.length})
            </h3>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-600">No documents yet</div>
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
                      <button 
                        onClick={() => window.open(doc.fileUrl || '#', '_blank')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors flex-shrink-0"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Notes</h3>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Write why you're approving or rejecting..."
              className="w-full h-32 p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">What Happened</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <HiClock className="text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">Case Started</div>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Decision</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDecision('APPROVE')}
                disabled={!reviewNotes || decision}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <HiCheckCircle />
                Approve
              </button>
              <button
                onClick={() => handleDecision('REJECT')}
                disabled={!reviewNotes || decision}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <HiXCircle />
                Reject
              </button>
              <button
                onClick={() => handleDecision('REQUEST_DOCS')}
                disabled={!reviewNotes || decision}
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <HiExclamation />
                Ask for More
              </button>
            </div>
          </div>

          {decision && (
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-medium text-slate-900 mb-1">Done!</div>
              <div className="text-xs text-slate-600">Your decision was saved. The person will get an email.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}