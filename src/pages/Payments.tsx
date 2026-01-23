import { CreditCard, Calendar, User, CheckCircle, Clock, XCircle, Download, Filter } from 'lucide-react';

const payments = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    guestName: 'Sarah Johnson',
    room: '204A',
    amount: 900,
    dueDate: '2024-01-31',
    paidDate: '2024-01-28',
    status: 'paid',
    method: 'Credit Card',
    description: 'Monthly Rent - January',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    guestName: 'Mike Chen',
    room: '301B',
    amount: 1500,
    dueDate: '2024-01-31',
    paidDate: null,
    status: 'pending',
    method: 'Bank Transfer',
    description: 'Monthly Rent - January',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2024-003',
    guestName: 'Emma Wilson',
    room: '102C',
    amount: 1800,
    dueDate: '2024-01-31',
    paidDate: '2024-01-30',
    status: 'paid',
    method: 'Cash',
    description: 'Monthly Rent - January',
  },
  {
    id: 4,
    invoiceNumber: 'INV-2024-004',
    guestName: 'David Brown',
    room: '205A',
    amount: 900,
    dueDate: '2024-01-31',
    paidDate: null,
    status: 'overdue',
    method: 'Credit Card',
    description: 'Monthly Rent - January',
  },
  {
    id: 5,
    invoiceNumber: 'INV-2024-005',
    guestName: 'Lisa Anderson',
    room: '303D',
    amount: 2400,
    dueDate: '2024-01-31',
    paidDate: '2024-01-25',
    status: 'paid',
    method: 'Bank Transfer',
    description: 'Monthly Rent - January',
  },
  {
    id: 6,
    invoiceNumber: 'INV-2024-006',
    guestName: 'James Taylor',
    room: '401B',
    amount: 1500,
    dueDate: '2024-01-31',
    paidDate: null,
    status: 'pending',
    method: 'Credit Card',
    description: 'Monthly Rent - January',
  },
];

const statusConfig = {
  paid: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  overdue: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export default function Payments() {
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-40 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.pexels.com/photos/259209/pexels-photo-259209.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Payments"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
            <div className="px-8">
              <h1 className="text-3xl font-bold text-white mb-1">Payment Management</h1>
              <p className="text-gray-200">Track and manage all financial transactions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">Collected this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-yellow-600 mt-1">Awaiting collection</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-gray-900">${overdueAmount.toLocaleString()}</p>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            <p className="text-xs text-blue-600 mt-1">This month</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              All Payments
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Paid
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Pending
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Overdue
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => {
                const StatusIcon = statusConfig[payment.status as keyof typeof statusConfig].icon;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-medium text-gray-900">
                        {payment.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div className="font-medium text-gray-900">{payment.guestName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg text-sm font-semibold">
                        {payment.room}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{payment.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{payment.method}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">${payment.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {payment.dueDate}
                      </div>
                      {payment.paidDate && (
                        <div className="text-xs text-green-600 mt-1">Paid: {payment.paidDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusConfig[payment.status as keyof typeof statusConfig].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
