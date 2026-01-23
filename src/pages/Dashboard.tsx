import { Users, Bed, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const stats = [
  {
    label: 'Total Residents',
    value: '248',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    label: 'Occupied Rooms',
    value: '156/180',
    change: '87%',
    trend: 'up',
    icon: Bed,
    color: 'bg-green-500',
  },
  {
    label: 'Pending Bookings',
    value: '23',
    change: '+5',
    trend: 'up',
    icon: Calendar,
    color: 'bg-orange-500',
  },
  {
    label: 'Monthly Revenue',
    value: '$45,200',
    change: '+18%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-emerald-500',
  },
];

const recentBookings = [
  { id: 1, name: 'Sarah Johnson', room: '204A', date: '2024-01-15', status: 'confirmed' },
  { id: 2, name: 'Mike Chen', room: '301B', date: '2024-01-16', status: 'pending' },
  { id: 3, name: 'Emma Wilson', room: '102C', date: '2024-01-17', status: 'confirmed' },
  { id: 4, name: 'David Brown', room: '205A', date: '2024-01-18', status: 'confirmed' },
];

const maintenanceAlerts = [
  { id: 1, room: '304B', issue: 'Air conditioning not working', priority: 'high', time: '2 hours ago' },
  { id: 2, room: '201A', issue: 'Leaking faucet', priority: 'medium', time: '5 hours ago' },
  { id: 3, room: '105C', issue: 'Door lock issue', priority: 'high', time: '1 day ago' },
];

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-48 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Hostel building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
            <div className="px-8">
              <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
              <p className="text-gray-200 text-lg">Here's what's happening with your hostel today</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{booking.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Alerts</h2>
          </div>
          <div className="p-6 space-y-4">
            {maintenanceAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-red-500"
              >
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  alert.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">Room {alert.room}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        alert.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{alert.issue}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
