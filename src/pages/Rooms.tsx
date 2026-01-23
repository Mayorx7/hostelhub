import { Users, Wifi, Wind, Tv, Plus, Filter } from 'lucide-react';

const rooms = [
  {
    id: 1,
    number: '101A',
    type: 'Single',
    floor: 1,
    capacity: 1,
    occupied: 1,
    status: 'occupied',
    price: 150,
    amenities: ['wifi', 'ac', 'tv'],
    image: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 2,
    number: '102B',
    type: 'Double',
    floor: 1,
    capacity: 2,
    occupied: 2,
    status: 'occupied',
    price: 250,
    amenities: ['wifi', 'ac', 'tv'],
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    number: '103C',
    type: 'Triple',
    floor: 1,
    capacity: 3,
    occupied: 0,
    status: 'available',
    price: 300,
    amenities: ['wifi', 'ac'],
    image: 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 4,
    number: '201A',
    type: 'Single',
    floor: 2,
    capacity: 1,
    occupied: 1,
    status: 'occupied',
    price: 150,
    amenities: ['wifi', 'ac', 'tv'],
    image: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 5,
    number: '202B',
    type: 'Double',
    floor: 2,
    capacity: 2,
    occupied: 0,
    status: 'available',
    price: 250,
    amenities: ['wifi', 'ac', 'tv'],
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 6,
    number: '203C',
    type: 'Quad',
    floor: 2,
    capacity: 4,
    occupied: 3,
    status: 'occupied',
    price: 400,
    amenities: ['wifi', 'ac'],
    image: 'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 7,
    number: '301A',
    type: 'Single',
    floor: 3,
    capacity: 1,
    occupied: 0,
    status: 'maintenance',
    price: 150,
    amenities: ['wifi', 'ac', 'tv'],
    image: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 8,
    number: '302B',
    type: 'Double',
    floor: 3,
    capacity: 2,
    occupied: 2,
    status: 'occupied',
    price: 250,
    amenities: ['wifi', 'ac', 'tv'],
    image: 'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const amenityIcons = {
  wifi: Wifi,
  ac: Wind,
  tv: Tv,
};

export default function Rooms() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="relative h-40 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Hostel rooms"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
            <div className="px-8">
              <h1 className="text-3xl font-bold text-white mb-1">Room Management</h1>
              <p className="text-gray-200">Manage and monitor all hostel rooms</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              All Rooms
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Available
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Occupied
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Maintenance
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={room.image}
                alt={`Room ${room.number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    room.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : room.status === 'occupied'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {room.status}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Room {room.number}</h3>
                <span className="text-lg font-bold text-blue-600">${room.price}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">{room.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Floor</span>
                  <span className="font-medium text-gray-900">{room.floor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Occupancy</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {room.occupied}/{room.capacity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                {room.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                  return (
                    <div
                      key={amenity}
                      className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg"
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                  );
                })}
              </div>

              <button className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
