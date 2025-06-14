import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { JournalClub } from '@prisma/client';

interface MapProps {
  journalClubs: JournalClub[] | undefined;
}

const Map = ({ journalClubs }: MapProps) => {
  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      const icon = await import('leaflet/dist/images/marker-icon.png');
      const iconShadow = await import(
        'leaflet/dist/images/marker-shadow.png'
      );
      const DefaultIcon = L.icon({
        iconUrl: icon.default.src,
        shadowUrl: iconShadow.default.src,
      });
      L.Marker.prototype.options.icon = DefaultIcon;
    })();
  }, []);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {journalClubs?.map((club) => (
        <Marker key={club.id} position={[club.lat, club.lng]}>
          <Popup>
            <h2 className="text-lg font-bold">{club.name}</h2>
            <p>{club.description}</p>
            <p>
              Meets {club.frequency} at {club.time}
            </p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
