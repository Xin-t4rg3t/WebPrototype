import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, AlertTriangle, Heart, TrendingUp } from 'lucide-react';

export function Overview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    openIncidents: 0,
    counselingSessions: 0,
    interventions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, incidents, counseling, interventions] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('counseling_records').select('id', { count: 'exact', head: true }),
        supabase.from('behavioral_interventions').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalStudents: students.count || 0,
        openIncidents: incidents.count || 0,
        counselingSessions: counseling.count || 0,
        interventions: interventions.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Open Incidents',
      value: stats.openIncidents,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Counseling Sessions',
      value: stats.counselingSessions,
      icon: Heart,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
    },
    {
      title: 'Active Interventions',
      value: stats.interventions,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-600 mt-2">Welcome to the Student Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <h3 className="font-medium text-slate-800 mb-1">Report Incident</h3>
            <p className="text-sm text-slate-600">Document a new behavioral incident</p>
          </button>
          <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <h3 className="font-medium text-slate-800 mb-1">Add Student</h3>
            <p className="text-sm text-slate-600">Register a new student profile</p>
          </button>
          <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <h3 className="font-medium text-slate-800 mb-1">Schedule Counseling</h3>
            <p className="text-sm text-slate-600">Create a new counseling session</p>
          </button>
        </div>
      </div>
    </div>
  );
}
