import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { Overview } from './components/Dashboard/Overview';
import { StudentManagement } from './components/Students/StudentManagement';
import { IncidentManagement } from './components/Incidents/IncidentManagement';
import { CounselingManagement } from './components/Counseling/CounselingManagement';
import { PeerMediationManagement } from './components/PeerMediation/PeerMediationManagement';
import { DeviceUsageManagement } from './components/DeviceUsage/DeviceUsageManagement';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'students':
        return <StudentManagement />;
      case 'incidents':
        return <IncidentManagement />;
      case 'counseling':
        return <CounselingManagement />;
      case 'mediation':
        return <PeerMediationManagement />;
      case 'devices':
        return <DeviceUsageManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
