import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { useState } from 'react'; // Removed useEffect as it's not used directly here now
import { trpc } from '~/utils/trpc';
import { useSession } from 'next-auth/react';
import type { inferRouterOutputs } from '@trpc/server'; // Import for inferring types
import type { AppRouter } from '~/server/routers/_app'; // Import your AppRouter

// Fix for default icon issue with Webpack
// @ts-ignore Property '_getIconUrl' does exist on type 'Default' but is not in the type definition.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Infer types for tRPC outputs
type RouterOutput = inferRouterOutputs<AppRouter>;
type JournalClubListOutput = RouterOutput['journalClub']['list'];
type JournalClubListItem = JournalClubListOutput[number];

// Define a type for the props of the CreateJournalClubForm if it were in a separate file
// For now, we'll just use an inline function for the form.
interface CreateJournalClubFormProps {
  position: LatLng;
  onClose: () => void;
  onClubCreated: () => void;
}

// Placeholder for the actual form - we will build this out properly later
const CreateJournalClubForm: React.FC<CreateJournalClubFormProps> = ({ position, onClose, onClubCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [frequency, setFrequency] = useState('');
  const utils = trpc.useUtils();

  const createClubMutation = trpc.journalClub.create.useMutation({
    onSuccess: () => {
      utils.journalClub.list.invalidate(); // Refetch list after creation
      onClubCreated(); // Call the callback to close form and clear marker
      onClose();
    },
    onError: (error) => {
      alert(`Error creating club: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClubMutation.mutate({
      name,
      description,
      latitude: position.lat,
      longitude: position.lng,
      meetingTime,
      frequency,
    });
  };

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '20px', zIndex: 1000, border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3 className="text-xl font-semibold mb-2">Create New Journal Club</h3>
      <p className="mb-2">At: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700">Meeting Time (e.g., Wednesdays at 5 PM PST):</label>
          <input type="text" id="meetingTime" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency (e.g., Weekly, Monthly):</label>
          <input type="text" id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
          <button type="submit" disabled={createClubMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {createClubMutation.isPending ? 'Creating...' : 'Create Club'}
          </button>
        </div>
      </form>
    </div>
  );
};


const MapEvents = ({ onMapClick, isCreating }: { onMapClick: (latLng: LatLng) => void; isCreating: boolean }) => {
  useMapEvents({
    click(e) {
      if (isCreating) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const Map = () => {
  const { data: session, status } = useSession();
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [newClubPosition, setNewClubPosition] = useState<LatLng | null>(null);

  const journalClubsQuery = trpc.journalClub.list.useQuery();

  const handleMapClick = (latLng: LatLng) => {
    if (isCreatingClub) {
      setNewClubPosition(latLng);
    }
  };

  const handleClubCreated = () => {
    setIsCreatingClub(false);
    setNewClubPosition(null);
  };
  
  const startCreatingClub = () => {
    if (status === 'authenticated') {
      setIsCreatingClub(true);
      setNewClubPosition(null); 
      alert("Click on the map to place your new journal club.");
    } else {
      alert("Please sign in to create a journal club.");
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {status === 'authenticated' && !isCreatingClub && !newClubPosition && (
        <button 
          onClick={startCreatingClub}
          style={{ position: 'absolute', top: '10px', left: '50px', zIndex: 1000, padding: '10px', background: 'lightblue' }}
        >
          Create New Journal Club
        </button>
      )}

      {isCreatingClub && newClubPosition && (
        <CreateJournalClubForm 
          position={newClubPosition} 
          onClose={() => {
            setIsCreatingClub(false);
            setNewClubPosition(null);
          }}
          onClubCreated={handleClubCreated}
        />
      )}

      <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={handleMapClick} isCreating={isCreatingClub && !newClubPosition} />

        {journalClubsQuery.data?.map((club: JournalClubListItem) => ( // Added type for club
          <Marker key={club.id} position={[club.latitude, club.longitude]}>
            <Popup>
              <b>{club.name}</b><br />
              {club.description}<br />
              <i>Meets: {club.meetingTime}, {club.frequency}</i><br />
              <small>Created by: {club.creator?.name || 'Unknown'}</small>
            </Popup>
          </Marker>
        ))}

        {isCreatingClub && newClubPosition && (
          <Marker position={newClubPosition} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
