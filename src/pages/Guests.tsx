import { Mail, Phone, MapPin, Calendar, Plus, Search, Filter } from 'lucide-react';

const guests = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    room: '204A',
    checkIn: '2023-09-15',
    checkOut: '2024-06-15',
    status: 'active',
    address: 'New York, USA',
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1 (555) 234-5678',
    room: '301B',
    checkIn: '2023-08-20',
    checkOut: '2024-05-20',
    status: 'active',
    address: 'San Francisco, USA',
  },
  {
    id: 3,
    name: 'Emma Wilson',
    email: 'emma.w@email.com',
    phone: '+1 (555) 345-6789',
    room: '102C',
    checkIn: '2023-10-01',
    checkOut: '2024-07-01',
    status: 'active',
    address: 'Boston, USA',
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david.b@email.com',
    phone: '+1 (555) 456-7890',
    room: '205A',
    checkIn: '2023-09-10',
    checkOut: '2024-06-10',
    status: 'active',
    address: 'Chicago, USA',
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 (555) 567-8901',
    room: '303D',
    checkIn: '2023-11-05',
    checkOut: '2024-01-20',
    status: 'pending-checkout',
    address: 'Seattle, USA',
  },
  {
    id: 6,
    name: 'James Taylor',
    email: 'james.t@email.com',
    phone: '+1 (555) 678-9012',
    room: '401B',
    checkIn: '2023-08-15',
    checkOut: '2024-05-15',
    status: 'active',
    address: 'Austin, USA',
  },
  {
    id: 7,
    name: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '+1 (555) 789-0123',
    room: '201C',
    checkIn: '2023-09-25',
    checkOut: '2024-06-25',
    status: 'active',
    address: 'Miami, USA',
  },
  {
    id: 8,
    name: 'Alex Kim',
    email: 'alex.k@email.com',
    phone: '+1 (555) 890-1234',
    room: '302A',
    checkIn: '2023-10-10',
    checkOut: '2024-07-10',
    status: 'active',
    address: 'Los Angeles, USA',
  },
];

export default function Guests() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-40 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Residents"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
            <div className="px-8">
              <h1 className="text-3xl font-bold text-white mb-1">Resident Management</h1>
              <p className="text-gray-200">Manage and track all hostel residents</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-200 w-full sm:w-96">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or room..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Resident
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
                  Resident
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check-out
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
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {guest.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{guest.name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {guest.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{guest.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg text-sm font-semibold">
                      {guest.room}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {guest.checkIn}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {guest.checkOut}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        guest.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
