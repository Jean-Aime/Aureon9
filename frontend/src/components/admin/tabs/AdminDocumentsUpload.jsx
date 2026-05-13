import { useState, useEffect } from 'react';
import { HiDocumentText, HiUpload, HiCheckCircle, HiClock, HiUser, HiX } from 'react-icons/hi';
import { documentsAPI, membersAPI } from '../../../api/client';

export default function AdminDocumentsUpload() {
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsResponse, membersResponse] = await Promise.all([
        documentsAPI.getAll(),
        membersAPI.getAll()
      ]);
      setDocuments(docsResponse.data || []);
      setMembers(membersResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDocument = async (docId, status, notes) => {
    try {
      await documentsAPI.updateReviewStatus(docId, { reviewStatus: status, reviewNotes: notes });
      fetchData();
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await documentsAPI.delete(docId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = statusFilter === 'ALL' || doc.reviewStatus === statusFilter;
    const matchesMember = selectedMember === 'ALL' || doc.memberProfileId === selectedMember;
    return matchesStatus && matchesMember;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-200 text-slate-800';
      case 'ACCEPTED':
      case 'APPROVED': return 'bg-slate-700 text-white';
      case 'REJECTED': return 'bg-slate-500 text-white';
      case 'EXPIRED': return 'bg-slate-400 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getDocTypeColor = (type) => {
    switch (type) {
      case 'IDENTITY_PROOF': return 'bg-slate-800 text-white';
      case 'ADDRESS_PROOF': return 'bg-slate-700 text-white';
      case 'BUSINESS_LICENSE': return 'bg-slate-600 text-white';
      case 'TAX_DOCUMENT': return 'bg-slate-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Management</h2>
          <p className="text-slate-600 mt-1">Review and manage member document uploads</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto">
          <HiUpload className="inline mr-2" />
          Bulk Upload
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiDocumentText className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
              <div className="text-sm text-slate-600">Total Documents</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {documents.filter(d => d.reviewStatus === 'PENDING').length}
              </div>
              <div className="text-sm text-slate-600">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {documents.filter(d => d.reviewStatus === 'ACCEPTED' || d.reviewStatus === 'APPROVED').length}
              </div>
              <div className="text-sm text-slate-600">Approved</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiX className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {documents.filter(d => d.reviewStatus === 'REJECTED').length}
              </div>
              <div className="text-sm text-slate-600">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="ALL">All Members</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.user?.name || member.displayName || 'Unknown'} - {member.user?.email}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No documents found</div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const member = members.find(m => m.id === doc.memberProfileId);
              const memberName = member?.user?.name || member?.displayName || 'Unknown Member';
              
              return (
                <div key={doc.id} className="border border-slate-200 rounded-2xl p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <HiDocumentText className="text-3xl text-slate-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.fileName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocTypeColor(doc.documentType)} flex-shrink-0`}>
                            {doc.documentType}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.reviewStatus)} flex-shrink-0`}>
                            {doc.reviewStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <HiUser className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{memberName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HiClock className="text-slate-400 flex-shrink-0" />
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {doc.reviewNotes && (
                          <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-2xl line-clamp-2">
                            {doc.reviewNotes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                        View
                      </button>
                      {doc.reviewStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewDocument(doc.id, 'ACCEPTED', 'Document approved')}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewDocument(doc.id, 'REJECTED', 'Document rejected')}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
