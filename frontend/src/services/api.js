const apiFetch = async (endpoint, options = {}) => {
  // Try relative /api first (works with Vite proxy or production mount)
  try {
    const res = await fetch(`/api${endpoint}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // try fallback
  }

  // Fallback to direct backend on 8000
  try {
    const res2 = await fetch(`http://127.0.0.1:8000/api${endpoint}`, options);
    if (res2.ok) {
      return await res2.json();
    }
  } catch (e) {
    // try localhost fallback
  }

  try {
    const res3 = await fetch(`http://localhost:8000/api${endpoint}`, options);
    if (res3.ok) {
      return await res3.json();
    }
  } catch (e) {}

  throw new Error(`Failed to fetch /api${endpoint}`);
};

export const fetchOverview = async (params = {}) => {
  const queryParams = {};
  if (params.datePreset || params.date_preset) queryParams.date_preset = params.datePreset || params.date_preset;
  if (params.marketplace) queryParams.marketplace = params.marketplace;
  if (params.state) queryParams.state = params.state;
  if (params.campaign) queryParams.campaign = params.campaign;
  const query = new URLSearchParams(queryParams).toString();
  return apiFetch(`/overview?${query}`);
};

export const fetchSales = async () => {
  return apiFetch('/sales');
};

export const fetchMarketing = async () => {
  return apiFetch('/marketing');
};

export const fetchMeta = async () => {
  return apiFetch('/meta');
};

export const fetchAmazon = async () => {
  return apiFetch('/amazon');
};

export const fetchFlipkart = async () => {
  return apiFetch('/flipkart');
};

export const fetchFunnels = async () => {
  return apiFetch('/funnel');
};

export const fetchRegional = async () => {
  return apiFetch('/regional');
};

export const fetchHourly = async (date = 'all') => {
  return apiFetch(`/hourly?date=${date}`);
};

export const fetchCreatives = async () => {
  return apiFetch('/creatives');
};

export const fetchAdvisor = async () => {
  return apiFetch('/advisor');
};

export const fetchForecast = async () => {
  return apiFetch('/forecast');
};

export const fetchControlRoom = async () => {
  return apiFetch('/control-room');
};

export const fetchCohort = async () => {
  return apiFetch('/cohort');
};

export const fetchCohortRetention = async () => {
  return apiFetch('/cohort-retention');
};

export const fetchMarketplaceComparison = async () => {
  return apiFetch('/marketplace-comparison');
};

export const fetchCampaignOrderFunnel = async () => {
  return apiFetch('/campaign-order-funnel');
};

export const fetchRegionalSalesIntelligence = async () => {
  return apiFetch('/regional-sales-intelligence');
};

export const fetchSouthLaunch = async () => {
  return apiFetch('/south-launch');
};

export const fetchDataQualityAudit = async () => {
  return apiFetch('/data-quality-audit');
};

export const fetchHourlyControlRoom = async (date = 'all') => {
  return apiFetch(`/hourly-control-room?date=${date}`);
};

export const fetchAnomalies = async () => {
  return apiFetch('/anomalies');
};

export const fetchQuality = async () => {
  return apiFetch('/data-quality');
};

export const fetchChanges = async () => {
  return apiFetch('/changes');
};

export const addChangeLog = async (changeData) => {
  return apiFetch('/changes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changeData)
  });
};

export const syncOrders = async () => {
  return apiFetch('/sync-orders');
};

export const syncTracker = async () => {
  return apiFetch('/sync-tracker');
};

export const syncUrl = async (source_type, url) => {
  return apiFetch('/sync-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_type, url })
  });
};

export const uploadCsvFile = async (source_type, file) => {
  const formData = new FormData();
  formData.append('source_type', source_type);
  formData.append('file', file);
  return apiFetch('/upload-csv', {
    method: 'POST',
    body: formData
  });
};

export const uploadCsvRawText = async (source_type, raw_csv) => {
  const formData = new FormData();
  formData.append('source_type', source_type);
  formData.append('raw_csv', raw_csv);
  return apiFetch('/upload-csv', {
    method: 'POST',
    body: formData
  });
};

export const fetchFlipkartApiStatus = async () => {
  return apiFetch('/flipkart-api/status');
};

export const configureFlipkartApi = async (app_id, app_secret) => {
  return apiFetch('/flipkart-api/configure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id, app_secret })
  });
};

export const fetchVisitorIntelligence = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/visitor-intelligence?${query}`);
};

export const fetchRetargetingAudiences = async () => {
  return apiFetch('/retargeting-audiences');
};
