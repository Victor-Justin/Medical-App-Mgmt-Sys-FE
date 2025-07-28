import { useGetPaymentsByUserIdQuery } from '../api/paymentsApi';
import { useSelector } from 'react-redux';
import { type RootState } from '../../features/store';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { useState, useMemo } from 'react';

const MyPayments = () => {
  const userId = useSelector((state: RootState) => state.user?.user?.user_id);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const {
    data: payments,
    isLoading,
    isError,
    error,
  } = useGetPaymentsByUserIdQuery(userId!, {
    skip: !userId,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!payments) return { total: 0, paid: 0, pending: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 };

    const total = payments.length;
    const paid = payments.filter(p => {
      const status = p.payments?.payStatus || p.payStatus;
      return status === 'paid';
    }).length;
    const pending = payments.filter(p => {
      const status = p.payments?.payStatus || p.payStatus;
      return status === 'unpaid';
    }).length;
    const totalAmount = payments.reduce((sum, p) => {
      const amount = p.payments?.amount || p.amount || 0;
      return sum + parseFloat(amount);
    }, 0);
    const paidAmount = payments
      .filter(p => {
        const status = p.payments?.payStatus || p.payStatus;
        return status === 'paid';
      })
      .reduce((sum, p) => {
        const amount = p.payments?.amount || p.amount || 0;
        return sum + parseFloat(amount);
      }, 0);
    const pendingAmount = payments
      .filter(p => {
        const status = p.payments?.payStatus || p.payStatus;
        return status === 'unpaid';
      })
      .reduce((sum, p) => {
        const amount = p.payments?.amount || p.amount || 0;
        return sum + parseFloat(amount);
      }, 0);

    return { total, paid, pending, totalAmount, paidAmount, pendingAmount };
  }, [payments]);

  // Filter payments based on selected status
  const filteredPayments = useMemo(() => {
    if (!payments || selectedStatus === 'ALL') return payments;
    
    return payments.filter(payment => {
      const status = payment.payments?.payStatus || payment.payStatus;
      
      if (selectedStatus === 'PAID') {
        return status === 'paid';
      }
      if (selectedStatus === 'PENDING') {
        return status === 'unpaid';
      }
      return status === selectedStatus.toLowerCase();
    });
  }, [payments, selectedStatus]);

  if (!userId) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-6">
            <h2 className="text-lg font-bold text-red-600">User not authenticated</h2>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold mb-2">Error Loading Payments</h3>
              <p className="text-red-600 text-sm">
                {error && typeof error === 'object' && 'message' in error 
                  ? (error as any).message 
                  : 'Failed to load payments. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h2>
            <p className="text-gray-600">Track and manage your payment history</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
            <div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedStatus('ALL')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">KES {stats.paidAmount.toLocaleString()}</p>
            </div>

            <div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedStatus('PAID')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedStatus('PENDING')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span className="font-medium text-gray-700">Filter by Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'ALL', label: 'All Payments', count: stats.total },
                  { value: 'PAID', label: 'Paid', count: stats.paid },
                  { value: 'PENDING', label: 'Unpaid', count: stats.pending }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedStatus === filter.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payments List */}
          {filteredPayments?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'ALL' 
                  ? "You haven't made any payments yet."
                  : selectedStatus === 'PENDING'
                  ? 'No unpaid payments found.'
                  : `No ${selectedStatus.toLowerCase()} payments found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments?.map((payment) => (
                <div
                  key={payment.payId}
                  className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          (payment.payments?.payStatus || payment.payStatus) === 'paid' 
                            ? 'bg-green-500' 
                            : 'bg-amber-500'
                        }`}></div>
                        <h3 className="text-xl font-bold text-gray-900">
                          KES {parseFloat(payment.payments?.amount || payment.amount || 0).toLocaleString()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            (payment.payments?.payStatus || payment.payStatus) === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {(payment.payments?.payStatus || payment.payStatus)?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                          </svg>
                          <span className="text-gray-600">Transaction ID: {payment.payments.transID}</span>
                        </div>
                        
                        {(payment.payments?.payStatus || payment.payStatus) === 'paid' && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">
                              Paid On: {new Date(payment.payments?.updatedOn || payment.updatedOn).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}

                        {(payment.payments?.payStatus || payment.payStatus) === 'unpaid' && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-amber-600 font-medium">Payment required</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {(payment.payments?.payStatus || payment.payStatus) === 'unpaid' && (
                        <button 
                          onClick={() => {
                            // Add your payment logic here
                            console.log('Initiating payment for:', payment.payId);
                            // You can call your payment API or redirect to payment page
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay Now
                        </button>
                      )}

                      {payment.appointments && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-w-0 sm:min-w-[280px]">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-800">Appointment Details</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Date: {payment.appointments.apDate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPayments;