const API_BASE = '';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const data = await response.json();
      errorDetail = data.detail || JSON.stringify(data);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Patients
  async getPatients() {
    const res = await fetch(`${API_BASE}/patients`);
    return handleResponse(res);
  },

  async getPatient(id) {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    return handleResponse(res);
  },

  async createPatient(data) {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updatePatient(id, data) {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deletePatient(id) {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Reports
  async uploadReport(patientId, formData) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/reports`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async getPatientReports(patientId) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/reports`);
    return handleResponse(res);
  },

  async getReport(reportId) {
    const res = await fetch(`${API_BASE}/reports/${reportId}`);
    return handleResponse(res);
  },

  async getReportResults(reportId) {
    const res = await fetch(`${API_BASE}/reports/${reportId}/results`);
    return handleResponse(res);
  },

  // Observations
  async getPatientObservations(patientId, statusFilter = '', unreviewedOnly = false) {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    if (unreviewedOnly) params.append('unreviewed_only', 'true');
    const res = await fetch(`${API_BASE}/patients/${patientId}/observations?${params.toString()}`);
    return handleResponse(res);
  },

  async reviewObservation(observationId, data) {
    const res = await fetch(`${API_BASE}/observations/${observationId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Timeline
  async getPatientTimeline(patientId) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/timeline`);
    return handleResponse(res);
  },

  // AI Summary
  async getPatientSummary(patientId) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/summary`);
    return handleResponse(res);
  },

  async generateSummary(patientId, options = {}) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return handleResponse(res);
  },

  // Conflicts
  async getPatientConflicts(patientId, activeOnly = true) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/conflicts?active_only=${activeOnly}`);
    return handleResponse(res);
  },

  async resolveConflict(conflictId, data) {
    const res = await fetch(`${API_BASE}/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Demo
  async seedDemoData() {
    const res = await fetch(`${API_BASE}/demo/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  getSyntheticPdfUrl() {
    return `${API_BASE}/demo/synthetic-report.pdf`;
  }
};

