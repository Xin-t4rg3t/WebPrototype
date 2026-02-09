import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DeviceUsageRecord, Student } from '../../lib/types';
import { Plus, Flag } from 'lucide-react';

export function DeviceUsageManagement() {
  const [records, setRecords] = useState<DeviceUsageRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    device_id: '',
    usage_start: '',
    usage_end: '',
    activity_description: '',
    flagged: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsData, studentsData] = await Promise.all([
        supabase
          .from('device_usage_records')
          .select('*, students(*)')
          .order('usage_start', { ascending: false }),
        supabase.from('students').select('*').order('full_name'),
      ]);

      if (recordsData.error) throw recordsData.error;
      if (studentsData.error) throw studentsData.error;

      setRecords(recordsData.data || []);
      setStudents(studentsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('device_usage_records').insert([formData]);
      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        student_id: '',
        device_id: '',
        usage_start: '',
        usage_end: '',
        activity_description: '',
        flagged: false,
      });
      loadData();
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const toggleFlag = async (id: string, currentFlag: boolean) => {
    try {
      const { error } = await supabase
        .from('device_usage_records')
        .update({ flagged: !currentFlag })
        .eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating flag:', error);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Device Usage Tracking</h1>
          <p className="text-slate-600 mt-1">Monitor student device usage and activities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Log Usage</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Device ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800">
                      {record.students?.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {record.device_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {record.usage_start
                      ? new Date(record.usage_start).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {record.usage_end ? new Date(record.usage_end).toLocaleString() : 'In Use'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {record.activity_description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFlag(record.id, record.flagged)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        record.flagged
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                      <span>{record.flagged ? 'Flagged' : 'Normal'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="p-6 text-center text-slate-500">No device usage records found</div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Log Device Usage</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Student *</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Device ID</label>
                <input
                  type="text"
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., LAPTOP-001, TABLET-042"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Usage Start
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.usage_start}
                    onChange={(e) => setFormData({ ...formData, usage_start: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Usage End
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.usage_end}
                    onChange={(e) => setFormData({ ...formData, usage_end: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Activity Description
                </label>
                <textarea
                  value={formData.activity_description}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="What was the device used for?"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="flagged"
                  checked={formData.flagged}
                  onChange={(e) => setFormData({ ...formData, flagged: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="flagged" className="ml-2 text-sm text-slate-700">
                  Flag for review
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
