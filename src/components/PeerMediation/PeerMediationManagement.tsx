import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PeerMediationSession } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Users } from 'lucide-react';

export function PeerMediationManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PeerMediationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    outcome: '',
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('peer_mediation_sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('peer_mediation_sessions').insert([
        {
          ...formData,
          mediator_user_id: user?.id,
        },
      ]);
      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        notes: '',
        outcome: '',
      });
      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Peer Mediation</h1>
          <p className="text-slate-600 mt-1">Track peer mediation sessions</p>
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
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Mediation Session</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(session.session_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {session.notes && (
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-700 mb-1">Notes:</p>
                <p className="text-sm text-slate-600">{session.notes}</p>
              </div>
            )}

            {session.outcome && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Outcome:</p>
                <p className="text-sm text-slate-600">{session.outcome}</p>
              </div>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No peer mediation sessions found</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Mediation Session</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="Session notes and details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Outcome</label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Outcome and resolution"
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
