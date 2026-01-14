
import React from 'react';
import { PlaceResult } from '../types';
import { MapPin, ArrowUpRight, MessageSquare } from 'lucide-react';

interface PlaceCardProps {
  place: PlaceResult;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 leading-tight truncate">
              <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              {place.title}
            </h3>
          </div>
          <a
            href={place.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200 active:bg-blue-700 shrink-0"
          >
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
        
        {place.snippets && place.snippets.length > 0 && (
          <div className="mt-4 space-y-2">
            {place.snippets.slice(0, 2).map((snippet, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
                <p className="line-clamp-3 leading-relaxed font-medium italic">"{snippet}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
