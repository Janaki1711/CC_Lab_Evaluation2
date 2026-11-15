import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
export const uploadErrors = new Rate('upload_errors');
export const uploadDuration = new Trend('upload_duration_ms', true);
export const bytesUploaded = new Counter('bytes_uploaded_total');

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Warm up
    { duration: '1m', target: 200 },    // Scale to 200 concurrent users
    { duration: '2m', target: 500 },    // Peak upload load: 500 users
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2000ms
    'upload_errors': ['rate<0.05'],      // Less than 5% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

// Generate simulated document binary
function generateMockPdf(sizeKb) {
  const header = `%PDF-1.4 Mock Upload Test ${Date.now()}\n`;
  const body = 'A'.repeat(Math.max(0, sizeKb * 1024 - header.length));
  return header + body;
}

const smallDoc = generateMockPdf(100);   // 100 KB
const mediumDoc = generateMockPdf(1024); // 1 MB

export function setup() {
  // Login to acquire bearer token
  const loginPayload = JSON.stringify({
    username: 'student1',
    password: 'password123',
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, params);
  check(res, { 'Setup Auth Success': (r) => r.status === 200 });
  const token = res.json('access_token');
  return { token };
}

export default function (data) {
  const token = data.token;
  const isMedium = Math.random() < 0.3; // 30% 1MB, 70% 100KB
  const fileContent = isMedium ? mediumDoc : smallDoc;
  const filename = `k6_test_${__VU}_${__ITER}_${isMedium ? '1MB' : '100KB'}.pdf`;

  const payload = {
    file: http.file(fileContent, filename, 'application/pdf'),
    title: `k6 Upload ${__VU}-${__ITER}`,
    description: 'Automated concurrent load benchmark for Pod Affinity evaluation',
    department: 'Computer Science & Engineering',
    course_code: 'CS501',
    submission_type: 'assignment',
    is_public: 'false',
  };

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: '30s',
  };

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/api/files/upload`, payload, params);
  const duration = Date.now() - startTime;
  uploadDuration.add(duration);

  const success = check(res, {
    'upload status is 201': (r) => r.status === 201,
  });

  if (success) {
    uploadErrors.add(0);
    bytesUploaded.add(fileContent.length);
  } else {
    uploadErrors.add(1);
    console.error(`Upload error [VU ${__VU}]: HTTP ${res.status} - ${res.body}`);
  }

  sleep(Math.random() * 2 + 1);
}
