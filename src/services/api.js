/**
 * CodePulse API Service — centralized fetch wrapper for all backend calls.
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err.detail || err.error || res.statusText;
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(res.status, `API Error (${res.status})`, detail);
  }

  return res.json();
}

/**
 * Repository and GitHub endpoints.
 */
export async function fetchRepository(repoUrl, token = '') {
  return request('POST', '/github/fetch', {
    repo_url: repoUrl,
    token: token || undefined,
  });
}

/**
 * Requirement and Analysis endpoints.
 */
export async function uploadRequirements(requirements, repoId) {
  return request('POST', '/analysis/upload-requirements', {
    requirements,
    repo_id: repoId,
  });
}

export async function startPipeline(repoId) {
  return request('POST', `/analysis/start-analysis?repo_id=${repoId}`);
}

export async function analyzeRequirements(requirements, repoId) {
  return request('POST', '/analysis/requirements', {
    requirements,
    repo_id: repoId,
  });
}

/**
 * Granular Dashboard endpoints.
 */
export async function getDashboardOverview(repoId) {
  return request('GET', `/dashboard/overview?repo_id=${repoId}`);
}

export async function getImpactScores(repoId) {
  return request('GET', `/dashboard/developer-impact?repo_id=${repoId}`);
}

export async function getRequirementMapping(repoId) {
  return request('GET', `/dashboard/requirement-mapping?repo_id=${repoId}`);
}

export async function getKnowledgeRisks(repoId) {
  return request('GET', `/dashboard/knowledge-risk?repo_id=${repoId}`);
}

/**
 * Combined Dashboard Summary.
 */
export async function getDashboardSummary(repoId) {
  return request('GET', `/dashboard/summary?repo_id=${repoId}`);
}

/**
 * Health check.
 */
export async function healthCheck() {
  return request('GET', '/health');
}
