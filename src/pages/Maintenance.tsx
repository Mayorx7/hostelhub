import { Wrench, AlertTriangle, Clock, CheckCircle, Plus, Filter } from 'lucide-react';

const maintenanceRequests = [
  {
    id: 1,
    ticketNumber: 'MAINT-001',
    room: '304B',
    issue: 'Air conditioning not working',
    description: 'AC unit not cooling properly, making loud noises',
    reportedBy: 'Sarah Johnson',
    reportedDate: '2024-01-20 09:30 AM',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'John Technician',
  },
  {
    id: 2,
    ticketNumber: 'MAINT-002',
    room: '201A',
    issue: 'Leaking faucet',
    description: 'Bathroom sink faucet dripping continuously',
    reportedBy: 'Mike Chen',
    reportedDate: '2024-01-20 02:15 PM',
    priority: 'medium',
    status: 'pending',
    assignedTo: null,
  },
  {
    id: 3,
    ticketNumber: 'MAINT-003',
    room: '105C',
    issue: 'Door lock malfunction',
    description: 'Electronic door lock not responding to keycard',
    reportedBy: 'Emma Wilson',
    reportedDate: '2024-01-19 08:00 PM',
    priority: 'high',
    status: 'pending',
    assignedTo: null,
  },
  {
    id: 4,
    ticketNumber: 'MAINT-004',
    room: '402D',
    issue: 'Light bulb replacement',
    description: 'Ceiling light not working in bedroom',
    reportedBy: 'David Brown',
    reportedDate: '2024-01-20 11:00 AM',
    priority: 'low',
    status: 'completed',
    assignedTo: 'Mike Electrician',
  },
  {
    id: 5,
    ticketNumber: 'MAINT-005',
    room: '203B',
    issue: 'WiFi connectivity issues',
    description: 'Unable to connect to internet, signal very weak',
    reportedBy: 'Lisa Anderson',
    reportedDate: '2024-01-20 03:45 PM',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Tom IT Support',
  },
  {
    id: 6,
    ticketNumber: 'MAINT-006',
    room: '301A',
    issue: 'Broken window',
    description: 'Window glass cracked, needs replacement',
    reportedBy: 'James Taylor',
    reportedDate: '2024-01-19 04:20 PM',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Paul Maintenance',
  },
  {
    id: 7,
    ticketNumber: 'MAINT-007',
    room: '104B',
    issue: 'Water heater not working',
    description: 'No hot water in bathroom',
    reportedBy: 'Maria Garcia',
    reportedDate: '2024-01-20 07:00 AM',
    priority: 'high',
    status: 'pending',
    assignedTo: null,
  },
  {
    id: 8,
    ticketNumber: 'MAINT-008',
    room: '205C',
    issue: 'Noisy ceiling fan',
    description: 'Ceiling fan making rattling noise',
    reportedBy: 'Alex Kim',
    reportedDate: '2024-01-19 10:30 AM',
    priority: 'low',
    status: 'completed',
    assignedTo: 'John Technician',
  },
];

const priorityConfig = {
  high: {
    color: 'bg-red-100 text-red-800 border-red-200',
    dotColor: 'bg-red-500',
    icon: AlertTriangle,
  },
  medium: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    dotColor: 'bg-orange-500',
    icon: Clock,
  },
  low: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-500',
    icon: Wrench,
  },
};

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    text: 'Pending',
  },
  'in-progress': {
    color: 'bg-blue-100 text-blue-800',
    text: 'In Progress',
  },
  completed: {
    color: 'bg-green-100 text-green-800',
    text: 'Completed',
  },
};

export default function Maintenance() {
  const pendingCount = maintenanceRequests.filter(r => r.status === 'pending').length;
  const inProgressCount = maintenanceRequests.filter(r => r.status === 'in-progress').length;
  const completedCount = maintenanceRequests.filter(r => r.status === 'completed').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-40 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Maintenance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
            <div className="px-8">
              <h1 className="text-3xl font-bold text-white mb-1">Maintenance Management</h1>
              <p className="text-gray-200">Track and resolve maintenance requests</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
            <p className="text-xs text-yellow-600 mt-1">Awaiting assignment</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-gray-900">{inProgressCount}</p>
            <p className="text-xs text-blue-600 mt-1">Being resolved</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-green-600 mt-1">This week</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              All Requests
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Pending
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              In Progress
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Completed
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {maintenanceRequests.map((request) => {
          const PriorityIcon = priorityConfig[request.priority as keyof typeof priorityConfig].icon;
          return (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${priorityConfig[request.priority as keyof typeof priorityConfig].color} border`}>
                    <PriorityIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{request.issue}</h3>
                    <p className="text-sm text-gray-500 font-mono">{request.ticketNumber}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[request.status as keyof typeof statusConfig].color}`}>
                  {statusConfig[request.status as keyof typeof statusConfig].text}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {request.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Room</p>
                  <p className="text-sm font-semibold text-gray-900">{request.room}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${priorityConfig[request.priority as keyof typeof priorityConfig].color} border`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[request.priority as keyof typeof priorityConfig].dotColor}`}></span>
                    {request.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported by:</span>
                  <span className="font-medium text-gray-900">{request.reportedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported:</span>
                  <span className="text-gray-900">{request.reportedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned to:</span>
                  <span className="font-medium text-gray-900">
                    {request.assignedTo || <span className="text-orange-600">Unassigned</span>}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm">
                  Update Status
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
