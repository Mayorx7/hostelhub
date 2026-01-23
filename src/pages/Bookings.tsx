import { Calendar, Clock, User, Bed, Plus, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const bookings = [
  {
    id: 1,
    guestName: 'John Smith',
    email: 'john.smith@email.com',
    room: '405A',
    roomType: 'Single',
    checkIn: '2024-02-01',
    checkOut: '2024-08-01',
    duration: '6 months',
    status: 'confirmed',
    amount: 900,
    bookingDate: '2024-01-10',
  },
  {
    id: 2,
    guestName: 'Emily Davis',
    email: 'emily.d@email.com',
    room: '302B',
    roomType: 'Double',
    checkIn: '2024-01-25',
    checkOut: '2024-07-25',
    duration: '6 months',
    status: 'pending',
    amount: 1500,
    bookingDate: '2024-01-15',
  },
  {
    id: 3,
    guestName: 'Robert Martinez',
    email: 'robert.m@email.com',
    room: '201C',
    roomType: 'Triple',
    checkIn: '2024-02-15',
    checkOut: '2024-08-15',
    duration: '6 months',
    status: 'confirmed',
    amount: 1800,
    bookingDate: '2024-01-18',
  },
  {
    id: 4,
    guestName: 'Sophie Turner',
    email: 'sophie.t@email.com',
    room: '104A',
    roomType: 'Single',
    checkIn: '2024-02-20',
    checkOut: '2024-05-20',
    duration: '3 months',
    status: 'pending',
    amount: 450,
    bookingDate: '2024-01-20',
  },
  {
    id: 5,
    guestName: 'Michael Lee',
    email: 'michael.l@email.com',
    room: '303D',
    roomType: 'Quad',
    checkIn: '2024-01-28',
    checkOut: '2024-07-28',
    duration: '6 months',
    status: 'confirmed',
    amount: 2400,
    bookingDate: '2024-01-12',
  },
  {
    id: 6,
    guestName: 'Anna White',
    email: 'anna.w@email.com',
    room: '205B',
    roomType: 'Double',
    checkIn: '2024-03-01',
    checkOut: '2024-09-01',
    duration: '6 months',
    status: 'cancelled',
    amount: 1500,
    bookingDate: '2024-01-08',
  },
];

const statusConfig = {
  confirmed: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  cancelled: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
};

export default function Bookings() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-40 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Bookings"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
            <div className="px-8">
              <h1 className="text-3xl font-bold text-white mb-1">Booking Management</h1>
              <p className="text-gray-200">Track and manage all reservations</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              All Bookings
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Confirmed
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Pending
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Cancelled
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">42</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Room Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
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
              {bookings.map((booking) => {
                const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig].icon;
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                          {booking.guestName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{booking.guestName}</div>
                          <div className="text-xs text-gray-500">{booking.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{booking.room}</div>
                          <div className="text-xs text-gray-500">{booking.roomType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.checkIn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.checkOut}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{booking.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">${booking.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusConfig[booking.status as keyof typeof statusConfig].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Manage
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
