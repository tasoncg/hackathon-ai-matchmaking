import { useEffect, useState } from 'react';
import { fieldsApi } from '../services/api';
import type { Field } from '../types';

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Field | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fieldsApi.getAll();
        setFields(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Football Fields</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(field => (
          <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900">{field.name}</h3>
              <StatusBadge status={field.status} />
            </div>
            <p className="text-sm text-gray-500 mb-2">{field.address}</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <StarIcon />
                <span className="text-sm font-medium">{field.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">
                {field.pricingModel === 'Hourly'
                  ? `${field.pricePerHour.toLocaleString()}₫/hr`
                  : `${field.pricePerHour.toLocaleString()}₫ fixed`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Owner: {field.ownerName}</p>
            <button
              onClick={() => setSelected(field)}
              className="w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
            >
              View Time Slots ({field.timeSlots.filter(s => s.status === 'Available').length} available)
            </button>
          </div>
        ))}
      </div>

      {/* Time Slots Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{selected.name} - Available Slots</h3>
            <div className="space-y-2">
              {selected.timeSlots
                .filter(s => s.status === 'Available')
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(slot.startTime).toLocaleDateString()} {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">
                      {slot.price ? `${slot.price.toLocaleString()}₫` : `${selected.pricePerHour.toLocaleString()}₫`}
                    </span>
                  </div>
                ))}
              {selected.timeSlots.filter(s => s.status === 'Available').length === 0 && (
                <p className="text-center text-gray-500 py-4">No available slots</p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Available: 'bg-green-100 text-green-700',
    Unavailable: 'bg-red-100 text-red-700',
    Maintenance: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
