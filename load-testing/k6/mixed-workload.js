import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ==============================================================================
// K6 MIXED CONCURRENT WORKLOAD BENCHMARK
// Exact distribution as specified in System Design Document (Section 13):
// • 60% File Download
// • 25% File Upload
// • 10% Metadata Search / Document Listing
// • 5% Document Deletion
// ==============================================================================

export const failureRate = new Rate('system_failures');
export const uploadLatency = new Trend('k6_upload_latency_ms', true);
export const downloadLatency = new Trend('k6_download_latency_ms', true);
export const listLatency = new Trend('k6_list_latency_ms', true);

// Configure test profile via environment variable or default to 500 users
const TEST_PROFILE = __ENV.TEST_PROFILE || 'mixed'; // baseline (100), mixed (500), peak (1000)

let stagesConfig = [
  { duration: '30s', target: 50 },
  { duration: '1m', target: 250 },
  { duration: '2m', target: 500 },
  { duration: '30s', target: 0 },
];

if (TEST_PROFILE === 'baseline') {
  stagesConfig = [
    { duration: '20s', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ];
} else if (TEST_PROFILE === 'peak') {
  stagesConfig = [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '30s', target: 0 },
  ];
}

export const options = {
  stages: stagesConfig,
  thresholds: {
    'http_req_duration': ['p(95)<1800'],
    'system_failures': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

function generateMockBuffer(kb) {
  const header = `%PDF-1.4 Academic Mixed Benchmark ${Date.now()}\n`;
  return header + 'X'.repeat(Math.max(0, kb * 1024 - header.length));
}

const docBuffer100K = generateMockBuffer(100);

export function setup() {
  // Login
  const loginPayload = JSON.stringify({
    username: 'student1',
    password: 'password123',
  });
  const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'Auth Login OK': (r) => r.status === 200 });
  const token = res.json('access_token');

  return { token };
}

export default function (data) {
  const token = data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const rand = Math.random();

  // 1. [60%] File Download
  if (rand < 0.60) {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/files/download/doc-001`, {
      headers,
      timeout: '20s',
    });
    downloadLatency.add(Date.now() - start);

    const ok = check(res, {
      'download status 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    failureRate.add(ok ? 0 : 1);
  }

  // 2. [25%] File Upload
  else if (rand < 0.85) {
    const filename = `mixed_k6_${__VU}_${__ITER}.pdf`;
    const payload = {
      file: http.file(docBuffer100K, filename, 'application/pdf'),
      title: `Mixed Bench ${__VU}-${__ITER}`,
      department: 'Computer Science & Engineering',
      course_code: 'CS501',
      submission_type: 'assignment',
      is_public: 'false',
    };

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/files/upload`, payload, {
      headers,
      timeout: '30s',
    });
    uploadLatency.add(Date.now() - start);

    const ok = check(res, {
      'upload status 201': (r) => r.status === 201,
    });
    failureRate.add(ok ? 0 : 1);
  }

  // 3. [10%] List & Search Documents
  else if (rand < 0.95) {
    const courses = ['CS501', 'CS502', 'CS503', 'CS504'];
    const course = courses[Math.floor(Math.random() * courses.length)];

    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/documents?course_code=${course}`, {
      headers,
      timeout: '10s',
    });
    listLatency.add(Date.now() - start);

    const ok = check(res, {
      'list status 200': (r) => r.status === 200,
    });
    failureRate.add(ok ? 0 : 1);
  }

  // 4. [5%] File Deletion
  else {
    const res = http.del(`${BASE_URL}/api/files/temp-doc-id`, null, {
      headers,
      timeout: '10s',
    });
    // Accept 200 or 404
    const ok = check(res, {
      'delete handled cleanly': (r) => r.status === 200 || r.status === 404,
    });
    failureRate.add(ok ? 0 : 1);
  }

  sleep(Math.random() * 1.5 + 0.5);
}
