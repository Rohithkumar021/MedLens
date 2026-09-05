import React, { useState, useEffect } from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ReviewModal from './components/ReviewModal';
import PatientFormModal from './components/PatientFormModal';
import UploadReportModal from './components/UploadReportModal';
import EvidenceChainModal from './components/EvidenceChainModal';

import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import ReportViewerPage from './pages/ReportViewerPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import TimelinePage from './pages/TimelinePage';
import ConflictsPage from './pages/ConflictsPage';
import SettingsPage from './pages/SettingsPage';

import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [observations, setObservations] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Signature Evidence Chain Modal State
  const [isEvidenceChainOpen, setIsEvidenceChainOpen] = useState(false);
  const [evidenceObservation, setEvidenceObservation] = useState(null);
  const [evidenceReport, setEvidenceReport] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  // Initial load
  useEffect(() => {
    loadPatients();
  }, []);

  // When active patient changes, fetch all associated clinical records
  useEffect(() => {
    if (currentPatientId) {
      loadPatientDetails(currentPatientId);
    } else {
      setCurrentPatient(null);
      setReports([]);
      setObservations([]);
      setConflicts([]);
      setTimeline([]);
      setSummary(null);
    }
  }, [currentPatientId]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const list = await api.getPatients();
      setPatients(list);
      if (list.length > 0 && !currentPatientId) {
        setCurrentPatientId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      setIsLoading(true);
      setErrorBanner('');

      const [pData, repData, obsData, confData, timeData, sumData] = await Promise.all([
        api.getPatient(patientId),
        api.getPatientReports(patientId),
        api.getPatientObservations(patientId),
        api.getPatientConflicts(patientId),
        api.getPatientTimeline(patientId),
        api.getPatientSummary(patientId).catch(() => null)
      ]);

      setCurrentPatient(pData);
      setReports(repData);
      setObservations(obsData);
      setConflicts(confData);
      setTimeline(timeData);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load patient details:', err);
      setErrorBanner(err.message || 'Failed to fetch patient data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsLoading(true);
      const seeded = await api.seedDemoData();
      await loadPatients();
      setCurrentPatientId(seeded.id);
      setCurrentTab('dashboard');
    } catch (err) {
      alert(`Error loading demo data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePatient = async (data) => {
    if (currentPatient) {
      const updated = await api.updatePatient(currentPatient.id, data);
      await loadPatients();
      setCurrentPatient(updated);
    } else {
      const created = await api.createPatient(data);
      await loadPatients();
      setCurrentPatientId(created.id);
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await api.deletePatient(patientId);
      const updated = patients.filter((p) => p.id !== patientId);
      setPatients(updated);
      if (currentPatientId === patientId) {
        setCurrentPatientId(updated[0]?.id || null);
      }
    } catch (err) {
      alert(`Failed to delete patient: ${err.message}`);
    }
  };

  const handleGenerateSummary = async () => {
    if (!currentPatientId) return;
    try {
      setIsGeneratingSummary(true);
      const newSummary = await api.generateSummary(currentPatientId);
      setSummary(newSummary);
      // Refresh timeline
      const timeData = await api.getPatientTimeline(currentPatientId);
      setTimeline(timeData);
    } catch (err) {
      alert(`Failed to generate summary: ${err.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleReviewObservation = async (observationId, reviewData) => {
    await api.reviewObservation(observationId, reviewData);
    // Reload observations & timeline
    const [obsData, timeData] = await Promise.all([
      api.getPatientObservations(currentPatientId),
      api.getPatientTimeline(currentPatientId)
    ]);
    setObservations(obsData);
    setTimeline(timeData);
  };

  const handleResolveConflict = async (conflictId, resolveData) => {
    await api.resolveConflict(conflictId, resolveData);
    const confData = await api.getPatientConflicts(currentPatientId);
    setConflicts(confData);
  };

  const openReviewModal = (obs) => {
    setSelectedObservation(obs);
    setIsReviewOpen(true);
  };

  const openEvidenceChain = (obs, rep) => {
    setEvidenceObservation(obs);
    setEvidenceReport(rep || reports.find(r => r.id === obs.report_id));
    setIsEvidenceChainOpen(true);
  };

  const unreviewedCount = observations.filter((o) => !o.is_reviewed).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Persistent Responsible AI Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Top App Navigation Header */}
      <Header
        currentPatient={currentPatient}
        patients={patients}
        onSelectPatient={(id) => setCurrentPatientId(id)}
        onNewPatient={() => {
          setCurrentPatient(null);
          setIsPatientFormOpen(true);
        }}
        onSeedDemo={handleSeedDemo}
        isLoading={isLoading}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* 3. Main Dashboard Body (Sidebar + Content View) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setTab={setCurrentTab}
          conflictsCount={conflicts.length}
          unreviewedCount={unreviewedCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Main Page View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {errorBanner && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorBanner}
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              patient={currentPatient}
              reports={reports}
              observations={observations}
              conflicts={conflicts}
              summary={summary}
              onGenerateSummary={handleGenerateSummary}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenReview={openReviewModal}
              onOpenPatientEdit={() => setIsPatientFormOpen(true)}
              onOpenEvidenceChain={openEvidenceChain}
              isGeneratingSummary={isGeneratingSummary}
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsPage
              patients={patients}
              currentPatient={currentPatient}
              onSelectPatient={(id) => {
                setCurrentPatientId(id);
                setCurrentTab('dashboard');
              }}
              onNewPatient={() => {
                setCurrentPatient(null);
                setIsPatientFormOpen(true);
              }}
              onDeletePatient={handleDeletePatient}
            />
          )}

          {currentTab === 'reports' && (
            <ReportViewerPage
              reports={reports}
              patient={currentPatient}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenReview={openReviewModal}
              onOpenEvidenceChain={openEvidenceChain}
            />
          )}

          {currentTab === 'review' && (
            <ReviewQueuePage
              observations={observations}
              reports={reports}
              patient={currentPatient}
              onOpenReview={openReviewModal}
              onOpenEvidenceChain={openEvidenceChain}
            />
          )}

          {currentTab === 'timeline' && (
            <TimelinePage
              timeline={timeline}
              patient={currentPatient}
            />
          )}

          {currentTab === 'conflicts' && (
            <ConflictsPage
              conflicts={conflicts}
              patient={currentPatient}
              onResolveConflict={handleResolveConflict}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Modals */}
      {isReviewOpen && selectedObservation && (
        <ReviewModal
          observation={selectedObservation}
          onClose={() => {
            setIsReviewOpen(false);
            setSelectedObservation(null);
          }}
          onReviewed={handleReviewObservation}
        />
      )}

      {isEvidenceChainOpen && evidenceObservation && (
        <EvidenceChainModal
          observation={evidenceObservation}
          report={evidenceReport}
          onClose={() => {
            setIsEvidenceChainOpen(false);
            setEvidenceObservation(null);
          }}
          onOpenReview={(obs) => {
            setIsEvidenceChainOpen(false);
            openReviewModal(obs);
          }}
        />
      )}

      {isPatientFormOpen && (
        <PatientFormModal
          patient={currentPatient}
          onClose={() => setIsPatientFormOpen(false)}
          onSaved={handleSavePatient}
        />
      )}

      {isUploadOpen && currentPatientId && (
        <UploadReportModal
          patientId={currentPatientId}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={async () => {
            await loadPatientDetails(currentPatientId);
            setCurrentTab('reports');
          }}
        />
      )}
    </div>
  );
}
