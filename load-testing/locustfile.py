import os
import io
import uuid
import random
from locust import HttpUser, task, between, events

# File payload generators
def generate_file_payload(size_kb: int) -> bytes:
    """Generates deterministic mock academic document buffer of given KB size"""
    header = f"%PDF-1.4 Academic Lab Benchmark Document {uuid.uuid4()}\n".encode('utf-8')
    body = b"0" * (size_kb * 1024 - len(header))
    return header + body

PAYLOADS = {
    "100KB": generate_file_payload(100),
    "1MB": generate_file_payload(1024),
    "5MB": generate_file_payload(5 * 1024),
    "10MB": generate_file_payload(10 * 1024),
}

COURSES = ["CS501", "CS502", "CS503", "CS504"]
SUBMISSION_TYPES = ["lab_record", "assignment", "project_report"]

class AcademicPlatformUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Simulate user login and JWT token acquisition"""
        # Alternate between student and teacher user profiles
        self.is_teacher = random.random() < 0.3
        self.username = "teacher1" if self.is_teacher else f"student_{random.randint(1, 50)}"
        self.jwt_token = None

        login_payload = {
            "username": "teacher1" if self.is_teacher else "student1",
            "password": "password123"
        }

        try:
            res = self.client.post("/api/auth/login", json=login_payload, name="/api/auth/login")
            if res.status_code == 200:
                self.jwt_token = res.json().get("access_token")
        except Exception:
            self.jwt_token = "mock-locust-benchmark-token"

        self.uploaded_doc_ids = []

    def get_auth_headers(self):
        headers = {}
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"
        return headers

    @task(3)
    def browse_and_search_documents(self):
        """Browse academic document library and search by keywords"""
        course = random.choice(COURSES)
        self.client.get(
            f"/api/documents?course_code={course}",
            headers=self.get_auth_headers(),
            name="/api/documents?course_code=[course]"
        )

    @task(2)
    def upload_document(self):
        """Upload academic document with varying file sizes to benchmark MinIO streaming"""
        size_key = random.choices(["100KB", "1MB", "5MB", "10MB"], weights=[40, 35, 20, 5])[0]
        payload = PAYLOADS[size_key]
        doc_id = str(uuid.uuid4())[:8]
        filename = f"Experiment_{doc_id}_{size_key}.pdf"

        files = {
            "file": (filename, io.BytesIO(payload), "application/pdf")
        }
        data = {
            "title": f"Laboratory Benchmark Submission {doc_id}",
            "description": f"Automated Locust benchmark payload ({size_key})",
            "course_code": random.choice(COURSES),
            "department": "Computer Science & Engineering",
            "submission_type": random.choice(SUBMISSION_TYPES),
            "is_public": "false"
        }

        with self.client.post(
            "/api/files/upload",
            files=files,
            data=data,
            headers=self.get_auth_headers(),
            name=f"/api/files/upload [{size_key}]",
            catch_response=True
        ) as response:
            if response.status_code == 201:
                doc = response.json().get("document", {})
                if "id" in doc:
                    self.uploaded_doc_ids.append(doc["id"])
                response.success()
            else:
                response.failure(f"Upload failed with code {response.status_code}")

    @task(4)
    def download_document(self):
        """Retrieve and stream binary document from MinIO via File Service"""
        target_id = None
        if self.uploaded_doc_ids:
            target_id = random.choice(self.uploaded_doc_ids)
        else:
            target_id = "doc-001"

        with self.client.get(
            f"/api/files/download/{target_id}",
            headers=self.get_auth_headers(),
            name="/api/files/download/[id]",
            catch_response=True
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Download failed with code {response.status_code}")

    @task(1)
    def inspect_cluster_topology(self):
        """Inspect live node and pod placement topology"""
        self.client.get(
            "/api/cluster/topology",
            headers=self.get_auth_headers(),
            name="/api/cluster/topology"
        )
