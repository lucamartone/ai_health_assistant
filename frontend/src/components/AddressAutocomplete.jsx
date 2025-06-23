import { useEffect, useRef } from 'react';
import loader_map from '../services/maps/loader';

function AddressAutocomplete({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    loader_map.load().then(() => {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'it' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const formatted = place.formatted_address;
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        if (formatted && lat && lng) {
          onChange({
            address: formatted,
            latitude: lat,
            longitude: lng
          });
        }
      });
    });
  }, []);

  return (
    <input
      type="text"
      ref={inputRef}
      value={value.address}
      onChange={(e) => onChange({ ...value, address: e.target.value })}
      placeholder="Inserisci indirizzo"
      className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

export default AddressAutocomplete;
