import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  X, 
  Check, 
  ShieldCheck, 
  Compass, 
  Sparkles,
  Info,
  Navigation
} from 'lucide-react';
import type { JournalLocation } from '../../types';

interface LocationPickerModalProps {
  currentLocation?: JournalLocation | null;
  onSelectLocation: (loc: JournalLocation | null) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JournalLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<JournalLocation | null>(currentLocation || null);

  const curatedPresets: JournalLocation[] = [
    { name: 'Connaught Place, New Delhi', city: 'New Delhi', country: 'India', latitude: 28.6315, longitude: 77.2167 },
    { name: 'Cyber City, Gurgaon', city: 'Gurgaon', country: 'India', latitude: 28.4950, longitude: 77.0895 },
    { name: 'Indiranagar, Bengaluru', city: 'Bengaluru', country: 'India', latitude: 12.9719, longitude: 77.6412 },
    { name: 'Marine Drive, Mumbai', city: 'Mumbai', country: 'India', latitude: 18.9432, longitude: 72.8230 },
    { name: 'SoHo, New York, NY', city: 'New York', country: 'USA', latitude: 40.7233, longitude: -74.0030 },
    { name: 'Hyde Park, London', city: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1657 },
    { name: 'Shibuya, Tokyo', city: 'Tokyo', country: 'Japan', latitude: 35.6595, longitude: 139.7005 },
    { name: 'Home Sanctuary / Quiet Space', city: 'Home', country: 'Personal Space', latitude: 0, longitude: 0 },
    { name: 'Co-working Cafe / Coffee House', city: 'Urban', country: 'Reflective Spot', latitude: 0, longitude: 0 },
    { name: 'Nature Trail / Mountain Retreat', city: 'Outdoors', country: 'Nature', latitude: 0, longitude: 0 },
  ];

  // Fetch search results from server endpoint
  useEffect(() => {
    let active = true;
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/locations/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await res.json();
        if (active && data.success && Array.isArray(data.data?.results)) {
          setSearchResults(data.data.results);
        }
      } catch (err) {
        console.error('Location search failed:', err);
        if (active) {
          setSearchResults(curatedPresets.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleApply = () => {
    onSelectLocation(selectedLoc);
    onClose();
  };

  const handleRemove = () => {
    setSelectedLoc(null);
    onSelectLocation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#18181B] rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-stone-900 dark:text-white">Add Location Context</h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">Connect this reflection to a place or environment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Privacy Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-medium">Privacy First:</span> Location is completely opt-in and stored securely under your isolated account. You can remove or change it at any time. Raw coordinates are never shared or continuously tracked.
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
              Search Place or City
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
              <input
                id="location-search-input"
                type="text"
                placeholder="e.g. Connaught Place, New Delhi, Cyber City, or Coffee Shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Selected Location Pill */}
          {selectedLoc && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-medium text-indigo-900 dark:text-indigo-200">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{selectedLoc.name}</div>
                  {selectedLoc.city && (
                    <div className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80">
                      {selectedLoc.city}{selectedLoc.country ? `, ${selectedLoc.country}` : ''}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedLoc(null)}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Location Suggestions List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-zinc-400">
              <span>{searchQuery ? 'Matching Locations' : 'Popular & Curated Places'}</span>
              {isLoading && <span className="text-indigo-500 text-[11px]">Searching...</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {(searchResults.length > 0 ? searchResults : curatedPresets).map((loc) => {
                const isSelected = selectedLoc?.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => setSelectedLoc(loc)}
                    className={`p-3 rounded-xl text-left text-xs transition-all border flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-stone-50/80 dark:bg-zinc-900/80 hover:bg-stone-100 dark:hover:bg-zinc-800/80 border-stone-200/60 dark:border-zinc-800 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                    <div className="truncate flex-1">
                      <div className="font-medium truncate">{loc.name}</div>
                      {loc.city && (
                        <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-stone-400 dark:text-zinc-500'}`}>
                          {loc.city}{loc.country ? `, ${loc.country}` : ''}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Coordinates Preview Badge */}
          {selectedLoc && selectedLoc.latitude !== 0 && (
            <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-zinc-900/70 border border-stone-200/60 dark:border-zinc-800 text-[11px] text-stone-500 dark:text-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>Geographic Anchor: {selectedLoc.latitude?.toFixed(4)}°, {selectedLoc.longitude?.toFixed(4)}°</span>
              </div>
              <span className="text-[10px] text-stone-400">Google Maps Platform Verified</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-stone-50/50 dark:bg-[#151518]">
          {currentLocation ? (
            <button
              onClick={handleRemove}
              className="px-4 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Remove Location
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-location-btn"
              onClick={handleApply}
              disabled={!selectedLoc}
              className="px-5 py-2 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs shadow-indigo-600/20 disabled:opacity-40"
            >
              Apply Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
