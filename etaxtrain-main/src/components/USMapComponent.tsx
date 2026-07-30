import React, { useState, useRef } from 'react';
import { MapPin, Layers, Search, ExternalLink, Compass, Info, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export interface USStateData {
  code: string;
  name: string;
  capital: string;
  timeZone: string;
  lat: number;
  lng: number;
  region: 'West' | 'Midwest' | 'South' | 'Northeast' | 'Non-Contiguous';
}

export const US_STATES_LIST: USStateData[] = [
  { code: 'AL', name: 'Alabama', capital: 'Montgomery', timeZone: 'Central (CST)', lat: 32.806671, lng: -86.79113, region: 'South' },
  { code: 'AK', name: 'Alaska', capital: 'Juneau', timeZone: 'Alaska (AKST)', lat: 61.370716, lng: -152.404419, region: 'Non-Contiguous' },
  { code: 'AZ', name: 'Arizona', capital: 'Phoenix', timeZone: 'Mountain (MST)', lat: 33.729759, lng: -111.431221, region: 'West' },
  { code: 'AR', name: 'Arkansas', capital: 'Little Rock', timeZone: 'Central (CST)', lat: 34.969704, lng: -92.373123, region: 'South' },
  { code: 'CA', name: 'California', capital: 'Sacramento', timeZone: 'Pacific (PST)', lat: 36.116203, lng: -119.681564, region: 'West' },
  { code: 'CO', name: 'Colorado', capital: 'Denver', timeZone: 'Mountain (MST)', lat: 39.059811, lng: -105.311104, region: 'West' },
  { code: 'CT', name: 'Connecticut', capital: 'Hartford', timeZone: 'Eastern (EST)', lat: 41.597782, lng: -72.755371, region: 'Northeast' },
  { code: 'DE', name: 'Delaware', capital: 'Dover', timeZone: 'Eastern (EST)', lat: 39.318523, lng: -75.507141, region: 'Northeast' },
  { code: 'DC', name: 'District of Columbia', capital: 'Washington', timeZone: 'Eastern (EST)', lat: 38.897438, lng: -77.026817, region: 'Northeast' },
  { code: 'FL', name: 'Florida', capital: 'Tallahassee', timeZone: 'Eastern (EST)', lat: 27.766279, lng: -81.686783, region: 'South' },
  { code: 'GA', name: 'Georgia', capital: 'Atlanta', timeZone: 'Eastern (EST)', lat: 33.040619, lng: -83.643074, region: 'South' },
  { code: 'HI', name: 'Hawaii', capital: 'Honolulu', timeZone: 'Hawaii (HST)', lat: 21.094318, lng: -157.498337, region: 'Non-Contiguous' },
  { code: 'ID', name: 'Idaho', capital: 'Boise', timeZone: 'Mountain (MST)', lat: 44.240459, lng: -114.478828, region: 'West' },
  { code: 'IL', name: 'Illinois', capital: 'Springfield', timeZone: 'Central (CST)', lat: 40.349566, lng: -88.986137, region: 'Midwest' },
  { code: 'IN', name: 'Indiana', capital: 'Indianapolis', timeZone: 'Eastern (EST)', lat: 39.849426, lng: -86.258278, region: 'Midwest' },
  { code: 'IA', name: 'Iowa', capital: 'Des Moines', timeZone: 'Central (CST)', lat: 42.011539, lng: -93.210526, region: 'Midwest' },
  { code: 'KS', name: 'Kansas', capital: 'Topeka', timeZone: 'Central (CST)', lat: 38.5266, lng: -96.726486, region: 'Midwest' },
  { code: 'KY', name: 'Kentucky', capital: 'Frankfort', timeZone: 'Eastern (EST)', lat: 37.66814, lng: -84.670067, region: 'South' },
  { code: 'LA', name: 'Louisiana', capital: 'Baton Rouge', timeZone: 'Central (CST)', lat: 31.169546, lng: -91.867805, region: 'South' },
  { code: 'ME', name: 'Maine', capital: 'Augusta', timeZone: 'Eastern (EST)', lat: 44.693947, lng: -69.381927, region: 'Northeast' },
  { code: 'MD', name: 'Maryland', capital: 'Annapolis', timeZone: 'Eastern (EST)', lat: 39.063946, lng: -76.802101, region: 'Northeast' },
  { code: 'MA', name: 'Massachusetts', capital: 'Boston', timeZone: 'Eastern (EST)', lat: 42.230171, lng: -71.530106, region: 'Northeast' },
  { code: 'MI', name: 'Michigan', capital: 'Lansing', timeZone: 'Eastern (EST)', lat: 43.326618, lng: -84.536095, region: 'Midwest' },
  { code: 'MN', name: 'Minnesota', capital: 'Saint Paul', timeZone: 'Central (CST)', lat: 45.694454, lng: -93.900192, region: 'Midwest' },
  { code: 'MS', name: 'Mississippi', capital: 'Jackson', timeZone: 'Central (CST)', lat: 32.741646, lng: -89.678696, region: 'South' },
  { code: 'MO', name: 'Missouri', capital: 'Jefferson City', timeZone: 'Central (CST)', lat: 38.456085, lng: -92.288368, region: 'Midwest' },
  { code: 'MT', name: 'Montana', capital: 'Helena', timeZone: 'Mountain (MST)', lat: 46.921925, lng: -110.454353, region: 'West' },
  { code: 'NE', name: 'Nebraska', capital: 'Lincoln', timeZone: 'Central (CST)', lat: 41.12537, lng: -98.268082, region: 'Midwest' },
  { code: 'NV', name: 'Nevada', capital: 'Carson City', timeZone: 'Pacific (PST)', lat: 38.313515, lng: -117.055374, region: 'West' },
  { code: 'NH', name: 'New Hampshire', capital: 'Concord', timeZone: 'Eastern (EST)', lat: 43.452492, lng: -71.563896, region: 'Northeast' },
  { code: 'NJ', name: 'New Jersey', capital: 'Trenton', timeZone: 'Eastern (EST)', lat: 40.29896, lng: -74.521011, region: 'Northeast' },
  { code: 'NM', name: 'New Mexico', capital: 'Santa Fe', timeZone: 'Mountain (MST)', lat: 34.840515, lng: -106.248482, region: 'West' },
  { code: 'NY', name: 'New York', capital: 'Albany', timeZone: 'Eastern (EST)', lat: 42.165726, lng: -74.948051, region: 'Northeast' },
  { code: 'NC', name: 'North Carolina', capital: 'Raleigh', timeZone: 'Eastern (EST)', lat: 35.630066, lng: -79.806419, region: 'South' },
  { code: 'ND', name: 'North Dakota', capital: 'Bismarck', timeZone: 'Central (CST)', lat: 47.528912, lng: -99.784012, region: 'Midwest' },
  { code: 'OH', name: 'Ohio', capital: 'Columbus', timeZone: 'Eastern (EST)', lat: 40.388783, lng: -82.764915, region: 'Midwest' },
  { code: 'OK', name: 'Oklahoma', capital: 'Oklahoma City', timeZone: 'Central (CST)', lat: 35.565342, lng: -96.928917, region: 'South' },
  { code: 'OR', name: 'Oregon', capital: 'Salem', timeZone: 'Pacific (PST)', lat: 44.572021, lng: -122.070938, region: 'West' },
  { code: 'PA', name: 'Pennsylvania', capital: 'Harrisburg', timeZone: 'Eastern (EST)', lat: 40.590752, lng: -77.209755, region: 'Northeast' },
  { code: 'RI', name: 'Rhode Island', capital: 'Providence', timeZone: 'Eastern (EST)', lat: 41.680893, lng: -71.51178, region: 'Northeast' },
  { code: 'SC', name: 'South Carolina', capital: 'Columbia', timeZone: 'Eastern (EST)', lat: 33.856892, lng: -80.945007, region: 'South' },
  { code: 'SD', name: 'South Dakota', capital: 'Pierre', timeZone: 'Central (CST)', lat: 44.299782, lng: -99.438828, region: 'Midwest' },
  { code: 'TN', name: 'Tennessee', capital: 'Nashville', timeZone: 'Central (CST)', lat: 35.747845, lng: -86.692345, region: 'South' },
  { code: 'TX', name: 'Texas', capital: 'Austin', timeZone: 'Central (CST)', lat: 31.054487, lng: -97.563461, region: 'South' },
  { code: 'UT', name: 'Utah', capital: 'Salt Lake City', timeZone: 'Mountain (MST)', lat: 40.150032, lng: -111.862434, region: 'West' },
  { code: 'VT', name: 'Vermont', capital: 'Montpelier', timeZone: 'Eastern (EST)', lat: 44.045876, lng: -72.710686, region: 'Northeast' },
  { code: 'VA', name: 'Virginia', capital: 'Richmond', timeZone: 'Eastern (EST)', lat: 37.769337, lng: -78.169968, region: 'South' },
  { code: 'WA', name: 'Washington', capital: 'Olympia', timeZone: 'Pacific (PST)', lat: 47.400902, lng: -121.490494, region: 'West' },
  { code: 'WV', name: 'West Virginia', capital: 'Charleston', timeZone: 'Eastern (EST)', lat: 38.491226, lng: -80.954453, region: 'South' },
  { code: 'WI', name: 'Wisconsin', capital: 'Madison', timeZone: 'Central (CST)', lat: 44.268543, lng: -89.616508, region: 'Midwest' },
  { code: 'WY', name: 'Wyoming', capital: 'Cheyenne', timeZone: 'Mountain (MST)', lat: 42.755966, lng: -107.30249, region: 'West' },
];

export const USMapComponent: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'osm' | 'interactive'>('osm');
  const [selectedState, setSelectedState] = useState<USStateData>(
    US_STATES_LIST.find((s) => s.code === 'IL') || US_STATES_LIST[13]
  );
  const [searchQuery, setSearchQuery] = useState('');

  const scrollStateRef = useRef<HTMLDivElement>(null);
  const hoverScrollRef = useRef<number | null>(null);

  const startHoverScroll = (direction: 'left' | 'right') => {
    stopHoverScroll();
    const scrollStep = () => {
      if (scrollStateRef.current) {
        scrollStateRef.current.scrollBy({
          left: direction === 'left' ? -6 : 6,
          behavior: 'auto',
        });
      }
      hoverScrollRef.current = requestAnimationFrame(scrollStep);
    };
    hoverScrollRef.current = requestAnimationFrame(scrollStep);
  };

  const stopHoverScroll = () => {
    if (hoverScrollRef.current !== null) {
      cancelAnimationFrame(hoverScrollRef.current);
      hoverScrollRef.current = null;
    }
  };

  const scrollStates = (direction: 'left' | 'right') => {
    if (scrollStateRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollStateRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Map locations for quick OSM jump
  const mapLocations = [
    { name: 'Chicago, IL (HQ)', lat: 41.8781, lng: -87.6298, zoom: 11, bbox: '-87.75,41.78,-87.50,41.98' },
    { name: 'Entire USA View', lat: 38.5, lng: -96.0, zoom: 4, bbox: '-128.0,22.0,-65.0,51.0' },
    { name: 'New York, NY', lat: 40.7128, lng: -74.006, zoom: 11, bbox: '-74.15,40.60,-73.85,40.82' },
    { name: 'Dallas, TX', lat: 32.7767, lng: -96.797, zoom: 10, bbox: '-96.95,32.65,-96.65,32.90' },
    { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, zoom: 10, bbox: '-118.45,33.90,-118.05,34.20' },
  ];

  const [currentBbox, setCurrentBbox] = useState(mapLocations[1].bbox);

  const filteredStates = US_STATES_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.capital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-8 border border-slate-200 rounded-2xl bg-white shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] px-3 py-1 rounded-full font-bold">
            <Compass className="w-3.5 h-3.5 text-indigo-300" />
            <span>Interactive OpenStreetMap & States Locator</span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            United States 50 States Map & Regional Coverage
          </h3>
          <p className="text-xs text-slate-300">
            OpenStreetMap geographic location system for all 50 USA states, DC, time zones, and tax filing regions.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('osm')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'osm'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>OpenStreetMap</span>
          </button>
          <button
            onClick={() => setActiveMode('interactive')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'interactive'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>50 States Grid & Abbreviations</span>
          </button>
        </div>
      </div>

      {/* 50 States Quick Selector Strip with Smooth Hover Arrows */}
      <div className="bg-slate-50 p-3.5 border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800">50 States + DC Quick Selector:</span>
            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border border-indigo-200">
              Active: {selectedState.code} — {selectedState.name}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Hover arrows to scroll • Click state to locate on OpenStreetMap
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => scrollStates('left')}
            onMouseEnter={() => startHoverScroll('left')}
            onMouseLeave={stopHoverScroll}
            onMouseDown={stopHoverScroll}
            onTouchStart={() => startHoverScroll('left')}
            onTouchEnd={stopHoverScroll}
            className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 hover:text-indigo-600 transition-colors shrink-0 shadow-xs border border-slate-300 cursor-pointer"
            title="Scroll Previous States (Hover or Click)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollStateRef}
            className="flex items-center space-x-1.5 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {US_STATES_LIST.map((st) => {
              const isSelected = selectedState.code === st.code;
              return (
                <button
                  key={st.code}
                  onClick={() => {
                    setSelectedState(st);
                    setCurrentBbox(`${st.lng - 0.8},${st.lat - 0.8},${st.lng + 0.8},${st.lat + 0.8}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all shrink-0 flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-extrabold shadow-md ring-2 ring-indigo-500 ring-offset-1'
                      : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 border border-slate-200 font-semibold'
                  }`}
                  title={`${st.name} (Capital: ${st.capital}) • Time Zone: ${st.timeZone}`}
                >
                  <span className="font-bold">{st.code}</span>
                  <span className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-600'} border-l border-current/30 pl-1.5`}>
                    {st.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollStates('right')}
            onMouseEnter={() => startHoverScroll('right')}
            onMouseLeave={stopHoverScroll}
            onMouseDown={stopHoverScroll}
            onTouchStart={() => startHoverScroll('right')}
            onTouchEnd={stopHoverScroll}
            className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 hover:text-indigo-600 transition-colors shrink-0 shadow-xs border border-slate-300 cursor-pointer"
            title="Scroll Next States (Hover or Click)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeMode === 'osm' ? (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Location Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-extrabold text-slate-800 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Quick OpenStreetMap Location Focus:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {mapLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setCurrentBbox(loc.bbox)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    currentBbox === loc.bbox
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded OpenStreetMap Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 h-[420px]">
            <iframe
              title="OpenStreetMap United States View"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentBbox}&layer=mapnik`}
            />

            {/* Overlay Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Live OpenStreetMap Engine (USA Coverage)</span>
            </div>

            <a
              href={`https://www.openstreetmap.org/#map=5/38.50/-96.00`}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 shadow-md text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <span>Open Full OpenStreetMap</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            </a>
          </div>
        </div>
      ) : (
        /* Interactive State Grid Mode */
        <div className="p-5 sm:p-6 space-y-6">
          {/* Search & Selected State Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search state name, 2-letter abbreviation (e.g. CA, NY, IL, TX)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors font-medium"
              />
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-indigo-500 block">Active Focus</span>
                <span className="font-extrabold text-indigo-950 text-sm">{selectedState.code} — {selectedState.name}</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono font-extrabold text-xs">
                {selectedState.timeZone.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* All 50 States + DC Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {filteredStates.map((st) => {
              const isSelected = selectedState.code === st.code;
              return (
                <button
                  key={st.code}
                  onClick={() => {
                    setSelectedState(st);
                    setCurrentBbox(`${st.lng - 0.8},${st.lat - 0.8},${st.lng + 0.8},${st.lat + 0.8}`);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between h-20 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500 ring-offset-1'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-800 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span className={`font-mono text-base font-black ${isSelected ? 'text-white' : 'text-indigo-700'}`}>
                    {st.code}
                  </span>
                  <span className={`text-[10px] font-bold leading-tight line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-600'}`}>
                    {st.name}
                  </span>
                  <span className={`text-[9px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {st.region}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected State Fact Box */}
          {selectedState && (
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-indigo-300 text-sm flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>State Details: {selectedState.name} ({selectedState.code})</span>
                </span>
                <p className="text-slate-300 text-xs">
                  State Capital: <strong>{selectedState.capital}</strong> • Timezone: <strong>{selectedState.timeZone}</strong> • Region: <strong>{selectedState.region}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveMode('osm');
                  setCurrentBbox(`${selectedState.lng - 0.8},${selectedState.lat - 0.8},${selectedState.lng + 0.8},${selectedState.lat + 0.8}`);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors flex items-center justify-center space-x-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View {selectedState.name} on OpenStreetMap</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between font-medium">
        <span className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>Official 50 USA States + District of Columbia (DC) E-Tax Training Location Reference</span>
        </span>
        <span className="font-mono text-slate-600 font-bold">50 States + DC</span>
      </div>
    </div>
  );
};
