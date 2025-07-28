import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAllUsersQuery,
  usePromoteToDoctorMutation,
  useDemoteToPatientMutation,
  useDeleteUserMutation,
  type User,
} from '../../dash/api/usersApi';
import { useGetDoctorByUserIdQuery } from '../../dash/api/doctorsApi';
import { skipToken } from '@reduxjs/toolkit/query';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

const ViewUsersPage = () => {
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useGetAllUsersQuery();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [promoteToDoctor] = usePromoteToDoctorMutation();
  const [demoteToPatient] = useDemoteToPatientMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'doctor' | 'patient'>('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: doctorInfo,
    isLoading: doctorLoading,
    error: doctorError,
  } = useGetDoctorByUserIdQuery(
    selectedUser?.role === 'doctor' ? selectedUser.userId : skipToken
  );


  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesEmail = user.email.toLowerCase().includes(emailSearch.toLowerCase());
      const matchesName = `${user.fName} ${user.lName}`.toLowerCase().includes(nameSearch.toLowerCase());
      
      return matchesRole && matchesEmail && matchesName;
    });


    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = `${a.fName} ${a.lName}`.toLowerCase();
          bValue = `${b.fName} ${b.lName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'date':
          aValue = new Date(a.createdOn).getTime();
          bValue = new Date(b.createdOn).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, roleFilter, emailSearch, nameSearch, sortBy, sortOrder]);

 
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1); 
  };

  const handlePromote = async (id: number) => {
    try {
      await toast.promise(promoteToDoctor(id).unwrap(), {
        loading: 'Promoting to doctor...',
        success: 'User promoted to doctor successfully!',
        error: (err) => `Promotion failed: ${err?.message || 'Unknown error'}`,
      });
      setSelectedUser(null);
      await refetch();
    } catch (error) {
      console.error('Promotion error:', error);
    }
  };

  const handleDemote = async (id: number) => {
    const confirmText = 'Are you sure you want to demote this doctor to a patient? This action cannot be undone.';
    if (!window.confirm(confirmText)) return;

    try {
      await toast.promise(demoteToPatient(id).unwrap(), {
        loading: 'Demoting to patient...',
        success: 'Doctor demoted to patient successfully!',
        error: (err) => `Demotion failed: ${err?.message || 'Unknown error'}`,
      });
      setSelectedUser(null);
      await refetch();
    } catch (error) {
      console.error('Demotion error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmText = 'Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.';
    if (!window.confirm(confirmText)) return;

    try {
      await toast.promise(deleteUser(id).unwrap(), {
        loading: 'Deleting user...',
        success: 'User deleted successfully!',
        error: (err) => `Delete failed: ${err?.message || 'Unknown error'}`,
      });
      setSelectedUser(null);
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setEmailSearch('');
    setNameSearch('');
    setCurrentPage(1);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'badge-primary';
      case 'doctor': return 'badge-accent';
      case 'patient': return 'badge-secondary';
      default: return 'badge-ghost';
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return <span className="opacity-50">↕️</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (error) {
    return (
      <div className="flex h-screen bg-base-100">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Topbar />
          <div className="p-6 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-error text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-error mb-2">Error Loading Users</h2>
              <p className="text-gray-600 mb-4">Failed to fetch user data from the server.</p>
              <button 
                className="btn btn-primary"
                onClick={() => refetch()}
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">User Management</h2>
              <p className="text-gray-600 mt-1">
                {filteredAndSortedUsers.length} of {users.length} users
                {(emailSearch || nameSearch || roleFilter !== 'all') && (
                  <span className="ml-2">
                    (filtered)
                    <button 
                      onClick={clearFilters}
                      className="btn btn-ghost btn-xs ml-2"
                    >
                      Clear filters
                    </button>
                  </span>
                )}
              </p>
            </div>
            
          
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">👥</div>
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">{users.length}</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-sm mb-6">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Filters & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Role</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Search by Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter name..."
                    value={nameSearch}
                    onChange={(e) => {
                      setNameSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Search by Email</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter email..."
                    value={emailSearch}
                    onChange={(e) => {
                      setEmailSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Items per page</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>


          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading loading-spinner loading-lg"></div>
              <span className="ml-4 text-lg">Loading users...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-300">
                    <tr>
                      <th>ID</th>
                      <th 
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => handleSort('name')}
                      >
                        Name <SortIcon column="name" />
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => handleSort('email')}
                      >
                        Email <SortIcon column="email" />
                      </th>
                      <th>Contact</th>
                      <th 
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => handleSort('role')}
                      >
                        Role <SortIcon column="role" />
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => handleSort('date')}
                      >
                        Joined <SortIcon column="date" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <tr
                          key={user.userId}
                          className="cursor-pointer hover:bg-base-200 transition-colors"
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="font-mono text-sm">{user.userId}</td>
                          <td className="font-medium">{user.fName} {user.lName}</td>
                          <td>{user.email}</td>
                          <td>{user.contactNo || 'N/A'}</td>
                          <td>
                            <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(user.createdOn).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl opacity-50">🔍</div>
                            <p className="text-gray-500">No users match your search criteria.</p>
                            <button 
                              onClick={clearFilters}
                              className="btn btn-sm btn-ghost"
                            >
                              Clear all filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      «
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 2;
                      })
                      .map((page, index, array) => {
                        if (index > 0 && array[index - 1] !== page - 1) {
                          return [
                            <button key={`ellipsis-${page}`} className="join-item btn btn-disabled">
                              ...
                            </button>,
                            <button
                              key={page}
                              className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          ];
                        }
                        return (
                          <button
                            key={page}
                            className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      })
                    }
                    
                    <button
                      className="join-item btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>


      {selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-2xl">User Details</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Name</span>
                  <p className="font-medium">{selectedUser.fName} {selectedUser.lName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone</span>
                  <p className="font-medium">{selectedUser.contactNo || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Role</span>
                  <div className="mt-1">
                    <span className={`badge ${getRoleBadgeColor(selectedUser.role)} badge-lg`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">User ID</span>
                  <p className="font-mono">{selectedUser.userId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Joined</span>
                  <p className="font-medium">{new Date(selectedUser.createdOn).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {selectedUser.role === 'doctor' && (
              <div className="border-t pt-4 mb-6">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  👨‍⚕️ Doctor Profile
                </h4>
                {doctorLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Loading doctor details...</span>
                  </div>
                ) : doctorError ? (
                  <div className="alert alert-error">
                    <span>Failed to load doctor information</span>
                  </div>
                ) : doctorInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Specialization</span>
                      <p className="font-medium">{doctorInfo.specialization}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Available Days</span>
                      <p className="font-medium">{doctorInfo.availableDays}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Contact</span>
                      <p className="font-medium">{doctorInfo.contactNo}</p>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <span>Doctor profile information not available</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 flex-wrap">
              {selectedUser.role === 'patient' && (
                <button
                  className="btn btn-success"
                  onClick={() => handlePromote(selectedUser.userId)}
                >
                  👨‍⚕️ Promote to Doctor
                </button>
              )}

              {selectedUser.role === 'doctor' && (
                <button
                  className="btn btn-warning"
                  onClick={() => handleDemote(selectedUser.userId)}
                >
                  👤 Demote to Patient
                </button>
              )}

              {selectedUser.role !== 'admin' && (
                <button
                  className="btn btn-error"
                  onClick={() => handleDelete(selectedUser.userId)}
                >
                  🗑️ Delete User
                </button>
              )}

              <button className="btn btn-ghost" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ViewUsersPage;