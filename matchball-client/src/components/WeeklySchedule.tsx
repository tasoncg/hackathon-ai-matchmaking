import { useState } from 'react';
import type { TeamScheduleSlot, DayOfWeekName } from '../types';
import { scheduleApi } from '../services/api';

const DAYS: DayOfWeekName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  teamId: string;
  slots: TeamScheduleSlot[];
  canEdit: boolean;
  onChanged: () => void;
}

interface FormState {
  id?: string;
  dayOfWeek: DayOfWeekName;
  startHour: number;
  endHour: number;
  fieldName: string;
  status: 'Available' | 'Booked';
  notes: string;
}

const emptyForm: FormState = {
  dayOfWeek: 'Monday',
  startHour: 18,
  endHour: 20,
  fieldName: '',
  status: 'Available',
  notes: '',
};

export default function WeeklySchedule({ teamId, slots, canEdit, onChanged }: Props) {
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        dayOfWeek: editing.dayOfWeek,
        startHour: editing.startHour,
        endHour: editing.endHour,
        fieldName: editing.fieldName || null,
        status: editing.status,
        notes: editing.notes || null,
      };
      if (editing.id) {
        await scheduleApi.update(teamId, editing.id, payload);
      } else {
        await scheduleApi.create(teamId, payload);
      }
      setEditing(null);
      onChanged();
    } catch {
      alert('Failed to save schedule slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule slot?')) return;
    try {
      await scheduleApi.remove(teamId, id);
      onChanged();
    } catch {
      alert('Failed to delete');
    }
  };

  const groupedByDay = DAYS.map((day, idx) => ({
    day,
    shortName: DAYS_SHORT[idx],
    slots: slots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startHour - b.startHour),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Weekly Schedule</h2>
        {canEdit && (
          <button
            onClick={() => setEditing({ ...emptyForm })}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700"
          >
            + Add Slot
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {groupedByDay.map(({ day, shortName, slots: daySlots }) => (
          <div key={day} className="border border-gray-100 rounded-lg p-2 min-h-[120px]">
            <p className="text-xs font-semibold text-gray-500 text-center mb-2">{shortName}</p>
            <div className="space-y-1.5">
              {daySlots.length === 0 && (
                <p className="text-[10px] text-gray-300 text-center py-2">—</p>
              )}
              {daySlots.map((s) => (
                <div
                  key={s.id}
                  className={`rounded p-2 text-[11px] border ${
                    s.status === 'Booked'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {formatHour(s.startHour)}-{formatHour(s.endHour)}
                  </div>
                  {s.fieldName && <div className="text-gray-500 truncate">{s.fieldName}</div>}
                  {s.status === 'Booked' && (
                    <div className="mt-0.5">
                      {s.opponentName ? (
                        <span className="inline-block bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                          vs {s.opponentName}
                        </span>
                      ) : (
                        <span className="inline-block bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                          BOOKED
                        </span>
                      )}
                    </div>
                  )}
                  {s.status === 'Available' && (
                    <div className="text-emerald-600 text-[9px] font-bold mt-0.5">OPEN</div>
                  )}
                  {canEdit && (
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() =>
                          setEditing({
                            id: s.id,
                            dayOfWeek: s.dayOfWeek,
                            startHour: s.startHour,
                            endHour: s.endHour,
                            fieldName: s.fieldName ?? '',
                            status: s.status,
                            notes: s.notes ?? '',
                          })
                        }
                        className="text-[9px] text-gray-500 hover:text-gray-800"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-[9px] text-red-400 hover:text-red-600"
                      >
                        del
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">{editing.id ? 'Edit Slot' : 'Add Slot'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={editing.dayOfWeek}
                  onChange={(e) => setEditing({ ...editing, dayOfWeek: e.target.value as DayOfWeekName })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={editing.startHour}
                    onChange={(e) => setEditing({ ...editing, startHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End hour</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={editing.endHour}
                    onChange={(e) => setEditing({ ...editing, endHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field / Location</label>
                <input
                  type="text"
                  value={editing.fieldName}
                  onChange={(e) => setEditing({ ...editing, fieldName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. Sân Thống Nhất"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as 'Available' | 'Booked' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
