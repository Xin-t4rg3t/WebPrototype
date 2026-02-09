import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Incident, Student, IncidentType } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Filter } from 'lucide-react';

export function IncidentManagement() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    student_id: '',
    incident_type_id: '',
    location: '',
    immediate_action: '',
    description: '',
    status: 'open',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incidentsData, studentsData, typesData] = await Promise.all([
        supabase
          .from('incidents')
          .select('*, students(*), incident_types(*)')
          .order('date_reported', { ascending: false }),
        supabase.from('students').select('*').order('full_name'),
        supabase.from('incident_types').select('*').order('name'),
      ]);

      if (incidentsData.error) throw incidentsData.error;
      if (studentsData.error) throw studentsData.error;
      if (typesData.error) throw typesData.error;

      setIncidents(incidentsData.data || []);
      setStudents(studentsData.data || []);
      setIncidentTypes(typesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('incidents').insert([
        {
          ...formData,
          reported_by_user_id: user?.id,
        },
      ]);
      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        student_id: '',
        incident_type_id: '',
        location: '',
        immediate_action: '',
        description: '',
        status: 'open',
      });
      loadData();
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('incidents').update({ status }).eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredIncidents =
    statusFilter === 'all'
      ? incidents
      : incidents.filter((incident) => incident.status === statusFilter);

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-700',
      investigating: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-slate-100 text-slate-700',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Incident Management</h1>
          <p className="text-slate-600 mt-1">Track and manage behavioral incidents</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Report Incident</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200 flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-slate-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {incident.students?.full_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>
                      <span className="font-medium">Type:</span>{' '}
                      {incident.incident_types?.name || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {incident.location || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(incident.date_reported).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <select
                  value={incident.status}
                  onChange={(e) => handleStatusUpdate(incident.id, e.target.value)}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {incident.description && (
                <p className="text-sm text-slate-700 mb-2">{incident.description}</p>
              )}
              {incident.immediate_action && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Action Taken:</span> {incident.immediate_action}
                </p>
              )}
            </div>
          ))}
          {filteredIncidents.length === 0 && (
            <div className="p-6 text-center text-slate-500">No incidents found</div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Report New Incident</h2>
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
                  Incident Type *
                </label>
                <select
                  value={formData.incident_type_id}
                  onChange={(e) => setFormData({ ...formData, incident_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select incident type</option>
                  {incidentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Classroom 101, Cafeteria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Immediate Action Taken
                </label>
                <textarea
                  value={formData.immediate_action}
                  onChange={(e) => setFormData({ ...formData, immediate_action: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
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
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
