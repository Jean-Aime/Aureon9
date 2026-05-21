import { useState, useEffect } from 'react';
import { HiShieldCheck, HiUser, HiCog, HiCheckCircle, HiX } from 'react-icons/hi';
import { adminPanelAPI } from '../../../api/client';

export default function AdminRoleMatrix() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminPanelAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { name: 'SUPER_ADMIN', permissions: ['ALL'] },
    { name: 'EXECUTIVE', permissions: ['GOVERNANCE', 'APPROVALS', 'REPORTS'] },
    { name: 'LEGAL_COMPLIANCE', permissions: ['VERIFICATION', 'DOCUMENTS', 'AUDIT'] },
    { name: 'QUALIFICATIONS', permissions: ['TIERS', 'CERTIFICATIONS', 'VERIFICATION'] },
    { name: 'CUSTOMER_SUCCESS', permissions: ['SUPPORT', 'ONBOARDING', 'MEMBERS'] },
    { name: 'FINANCE_TREASURY', permissions: ['WALLETS', 'TRANSACTIONS', 'DISTRIBUTIONS'] },
    { name: 'MEMBER', permissions: ['PROFILE', 'WALLET', 'OPPORTUNITIES'] },
    { name: 'PARTNER', permissions: ['OPPORTUNITIES', 'REFERRALS'] },
    { name: 'OPERATOR', permissions: ['OPERATIONS', 'MONITORING'] }
  ];

  const permissions = [
    'ALL', 'GOVERNANCE', 'APPROVALS', 'REPORTS', 'VERIFICATION', 'DOCUMENTS', 
    'AUDIT', 'TIERS', 'CERTIFICATIONS', 'SUPPORT', 'ONBOARDING', 'MEMBERS',
    'WALLETS', 'TRANSACTIONS', 'DISTRIBUTIONS', 'PROFILE', 'OPPORTUNITIES', 
    'REFERRALS', 'OPERATIONS', 'MONITORING'
  ];

  const filteredUsers = roleFilter === 'ALL' 
    ? users 
    : users.filter(u => u.role === roleFilter);

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-slate-900 text-white';
      case 'EXECUTIVE': return 'bg-slate-800 text-white';
      case 'LEGAL_COMPLIANCE': return 'bg-slate-700 text-white';
      case 'QUALIFICATIONS': return 'bg-slate-600 text-white';
      case 'CUSTOMER_SUCCESS': return 'bg-slate-500 text-white';
      case 'FINANCE_TREASURY': return 'bg-slate-600 text-white';
      case 'MEMBER': return 'bg-slate-400 text-white';
      case 'PARTNER': return 'bg-slate-500 text-white';
      case 'OPERATOR': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  const hasPermission = (role, permission) => {
    const roleData = roles.find(r => r.name === role);
    return roleData?.permissions.includes('ALL') || roleData?.permissions.includes(permission);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Role & Permissions Matrix</h2>
          <p className="text-slate-600 mt-1">Manage user roles and access permissions</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors">
          <HiCog className="inline mr-2" />
          Configure Roles
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiShieldCheck className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{roles.length}</div>
              <div className="text-sm text-slate-600">Total Roles</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{users.length}</div>
              <div className="text-sm text-slate-600">Total Users</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{permissions.length}</div>
              <div className="text-sm text-slate-600">Permissions</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiShieldCheck className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {users.filter(u => ['SUPER_ADMIN', 'EXECUTIVE'].includes(u.role)).length}
              </div>
              <div className="text-sm text-slate-600">Admin Users</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                {permissions.slice(0, 8).map(permission => (
                  <th key={permission} className="text-center py-3 px-2 text-xs font-semibold text-slate-700">
                    {permission}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role.name)}`}>
                      {role.name}
                    </span>
                  </td>
                  {permissions.slice(0, 8).map(permission => (
                    <td key={permission} className="text-center py-3 px-2">
                      {hasPermission(role.name, permission) ? (
                        <HiCheckCircle className="inline text-slate-700 text-lg" />
                      ) : (
                        <HiX className="inline text-slate-300 text-lg" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">User Role Assignments</h3>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="ALL">All Roles</option>
            {roles.map(role => (
              <option key={role.name} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <HiUser className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}