import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CounselingRecord, Student } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Calendar } from 'lucide-react';

export function CounselingManagement() {
  const { user } = useAuth();
  const [records, setRecords] = useState<CounselingRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    session_notes: '',
    outcome: '',
    follow_up_required: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsData, studentsData] = await Promise.all([
        supabase
          .from('counseling_records')
          .select('*, students(*)')
          .order('session_date', { ascending: false }),
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
      const { error } = await supabase.from('counseling_records').insert([
        {
          ...formData,
          counselor_user_id: user?.id,
        },
      ]);
      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        student_id: '',
        session_notes: '',
        outcome: '',
        follow_up_required: false,
      });
      loadData();
    } catch (error) {
      console.error('Error creating counseling record:', error);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Counseling Records</h1>
          <p className="text-slate-600 mt-1">Track counseling sessions and outcomes</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Session</span>
        </button>
      </div>

      <div className="grid gap-6">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {record.students?.full_name}
                </h3>
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(record.session_date).toLocaleString()}
                </div>
              </div>
              {record.follow_up_required && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                  Follow-up Required
                </span>
              )}
            </div>

            {record.session_notes && (
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-700 mb-1">Session Notes:</p>
                <p className="text-sm text-slate-600">{record.session_notes}</p>
              </div>
            )}

            {record.outcome && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Outcome:</p>
                <p className="text-sm text-slate-600">{record.outcome}</p>
              </div>
            )}
          </div>
        ))}

        {records.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No counseling records found</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Counseling Session</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Notes
                </label>
                <textarea
                  value={formData.session_notes}
                  onChange={(e) => setFormData({ ...formData, session_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Outcome</label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="follow_up"
                  checked={formData.follow_up_required}
                  onChange={(e) =>
                    setFormData({ ...formData, follow_up_required: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="follow_up" className="ml-2 text-sm text-slate-700">
                  Follow-up required
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
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
