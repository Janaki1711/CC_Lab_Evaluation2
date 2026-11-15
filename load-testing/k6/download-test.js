import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

export const downloadErrors = new Rate('download_errors');
export const downloadDuration = new Trend('download_duration_ms', true);
export const bytesDownloaded = new Counter('bytes_downloaded_total');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 250 },
    { duration: '2m', target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1500'],
    'download_errors': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

export function setup() {
  // Login as student
  const loginPayload = JSON.stringify({
    username: 'student1',
    password: 'password123',
  });
  const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'Setup Auth Success': (r) => r.status === 200 });
  const token = res.json('access_token');

  // Query existing documents to download
  const docsRes = http.get(`${BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let docIds = [];
  if (docsRes.status === 200) {
    const list = docsRes.json();
    docIds = list.map((d) => d.id);
  }

  return { token, docIds };
}

export default function (data) {
  const token = data.token;
  const docIds = data.docIds;

  let targetId = 'doc-001';
  if (docIds && docIds.length > 0) {
    targetId = docIds[Math.floor(Math.random() * docIds.length)];
  }

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: '20s',
  };

  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/api/files/download/${targetId}`, params);
  const duration = Date.now() - startTime;
  downloadDuration.add(duration);

  const success = check(res, {
    'download status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  if (res.status === 200) {
    downloadErrors.add(0);
    bytesDownloaded.add(res.body.length);
  } else if (res.status === 404) {
    downloadErrors.add(0); // Not a server failure
  } else {
    downloadErrors.add(1);
    console.error(`Download error [VU ${__VU}]: HTTP ${res.status}`);
  }

  sleep(Math.random() * 1.5 + 0.5);
}
