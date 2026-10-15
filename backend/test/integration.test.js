const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");

// Run these checks only against a dedicated test database with the schema loaded.
test("Lasry and Denis integration", {
  skip: process.env.RUN_INTEGRATION_TESTS !== "1",
}, async (t) => {
  assert.ok(
    process.env.DB_NAME?.startsWith("wtms_test_"),
    "DB_NAME must start with wtms_test_ to protect development data",
  );

  // Never write test CVs into the development storage directory.
  const fs = require("node:fs/promises");
  const os = require("node:os");
  const path = require("node:path");
  const { PDFDocument } = require("pdf-lib");
  const cvStorageDir = await fs.mkdtemp(path.join(os.tmpdir(), "wtms-test-cv-"));
  process.env.CV_STORAGE_DIR = cvStorageDir;
  t.after(() => fs.rm(cvStorageDir, { recursive: true, force: true }));

  const app = require("../src/app");
  const pool = require("../src/db/pool");
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  async function request(path, { method = "GET", body, cookie } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (cookie) headers.Cookie = cookie;

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const responseBody = await response.text();
    let data = null;
    if (responseBody) {
      try {
        data = JSON.parse(responseBody);
      } catch {
        data = responseBody;
      }
    }

    return {
      status: response.status,
      cookie: response.headers.get("set-cookie")?.split(";")[0],
      data: response.status === 204 ? null : data,
    };
  }

  const account = {
    first_name: "Integration",
    last_name: "Candidate",
    email: `candidate-${Date.now()}@example.com`,
    password: "Integration2026!",
    role: "ADMIN",
  };
  let userId;
  let userCookie;
  let secondUserId;
  let secondUserCookie;
  let adminId;
  let adminCookie;
  let companyId;
  let categoryId;
  let publishedId;
  let closedId;
  let applicationId;
  let projectId;
  let experienceId;
  let secondCvId;

  await t.test("registration, login and profile keep the default USER role", async () => {
    assert.equal((await request("/api/auth/me")).status, 401);
    assert.equal((await request("/api/auth/register", { method: "POST", body: {} })).status, 400);
    const created = await request("/api/auth/register", { method: "POST", body: account });
    assert.equal(created.status, 201);
    assert.equal(created.data.role, "USER");
    assert.equal(created.data.password_hash, undefined);
    userId = created.data.id;
    assert.equal((await request("/api/auth/register", { method: "POST", body: account })).status, 409);
    assert.equal((await request("/api/auth/login", {
      method: "POST", body: { ...account, password: "wrong-password" },
    })).status, 401);
    const login = await request("/api/auth/login", { method: "POST", body: account });
    assert.equal(login.status, 200);
    assert.ok(login.cookie);
    userCookie = login.cookie;
    const profile = await request("/api/auth/me", { cookie: userCookie });
    assert.equal(profile.status, 200);
    assert.equal(profile.data.id, userId);
    assert.equal(profile.data.email, account.email);
    assert.equal(profile.data.password_hash, undefined);
  });

  await t.test("candidate profile can be updated without changing its role", async () => {
    assert.equal((await request("/api/people/me")).status, 401);

    const secondAccount = {
      first_name: "Other",
      last_name: "Candidate",
      email: `other-${Date.now()}@example.com`,
      password: "Integration2026!",
    };
    const secondCreated = await request("/api/auth/register", {
      method: "POST",
      body: secondAccount,
    });
    assert.equal(secondCreated.status, 201);
    secondUserId = secondCreated.data.id;
    const secondLogin = await request("/api/auth/login", {
      method: "POST",
      body: secondAccount,
    });
    assert.equal(secondLogin.status, 200);
    secondUserCookie = secondLogin.cookie;

    const profile = await request("/api/people/me", { cookie: userCookie });
    assert.equal(profile.status, 200);
    assert.equal(profile.data.id, userId);
    assert.equal(profile.data.role, "USER");
    assert.equal(profile.data.password_hash, undefined);

    const updated = await request("/api/people/me", {
      method: "PATCH",
      cookie: userCookie,
      body: { first_name: "Updated", phone: "0612345678" },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.first_name, "Updated");
    assert.equal(updated.data.phone, "0612345678");
    assert.equal(updated.data.role, "USER");

    assert.equal((await request("/api/people/me", {
      method: "PATCH",
      cookie: userCookie,
      body: { role: "ADMIN" },
    })).status, 400);
    assert.equal((await request("/api/people/me", {
      method: "PATCH",
      cookie: userCookie,
      body: { first_name: " " },
    })).status, 400);
    assert.equal((await request("/api/people/me", {
      method: "PATCH",
      cookie: userCookie,
      body: { email: secondAccount.email },
    })).status, 409);

    const unchanged = await pool.query(
      "SELECT first_name, email, role FROM people WHERE id = $1",
      [userId],
    );
    assert.equal(unchanged.rows[0].first_name, "Updated");
    assert.equal(unchanged.rows[0].email, account.email);
    assert.equal(unchanged.rows[0].role, "USER");
  });

  await t.test("projects belong to their candidate and reject invalid data", async () => {
    assert.equal((await request("/api/projects")).status, 401);
    assert.equal((await request("/api/projects", {
      method: "POST",
      body: { title: "No session" },
    })).status, 401);
    assert.equal((await request("/api/projects", {
      method: "POST",
      cookie: userCookie,
      body: { title: " " },
    })).status, 400);

    const projectFields = {
      title: "Portfolio",
      description: "A small web project.",
      project_url: "https://example.com/project",
      repository_url: "https://github.com/example/project",
    };
    assert.equal((await request("/api/projects", {
      method: "POST",
      cookie: userCookie,
      body: { ...projectFields, person_id: secondUserId },
    })).status, 400);
    const created = await request("/api/projects", {
      method: "POST",
      cookie: userCookie,
      body: projectFields,
    });
    assert.equal(created.status, 201);
    assert.equal(created.data.person_id, undefined);
    projectId = created.data.id;
    assert.equal((await pool.query(
      "SELECT person_id FROM projects WHERE id = $1",
      [projectId],
    )).rows[0].person_id, userId);

    const ownList = await request("/api/projects", { cookie: userCookie });
    assert.equal(ownList.status, 200);
    assert.ok(ownList.data.some((project) => project.id === projectId));
    assert.deepEqual((await request("/api/projects", { cookie: secondUserCookie })).data, []);
    assert.equal((await request(`/api/projects/${projectId}`, {
      method: "PATCH",
      cookie: secondUserCookie,
      body: { title: "Takeover" },
    })).status, 404);
    assert.equal((await request(`/api/projects/${projectId}`, {
      method: "DELETE",
      cookie: secondUserCookie,
    })).status, 404);
    assert.equal((await request(`/api/projects/${projectId}`, {
      method: "PATCH",
      cookie: userCookie,
      body: { project_url: "javascript:alert(1)" },
    })).status, 400);

    const updated = await request(`/api/projects/${projectId}`, {
      method: "PATCH",
      cookie: userCookie,
      body: { title: "Portfolio updated", repository_url: "" },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.title, "Portfolio updated");
    assert.equal(updated.data.repository_url, null);
  });

  await t.test("experiences belong to their candidate and validate dates", async () => {
    assert.equal((await request("/api/experiences")).status, 401);
    assert.equal((await request("/api/experiences", {
      method: "POST",
      cookie: userCookie,
      body: { company_name: " ", job_title: "Developer" },
    })).status, 400);
    assert.equal((await request("/api/experiences", {
      method: "POST",
      cookie: userCookie,
      body: {
        company_name: "Savane Tech",
        job_title: "Developer",
        start_date: "2023-04-01",
        end_date: "2022-03-01",
      },
    })).status, 400);
    assert.equal((await request("/api/experiences", {
      method: "POST",
      cookie: userCookie,
      body: {
        company_name: "Savane Tech",
        job_title: "Developer",
        start_date: "2023-02-30",
      },
    })).status, 400);

    const experienceFields = {
      company_name: "Savane Tech",
      job_title: "Developer",
      description: "Built web pages.",
      start_date: "2023-04-01",
      end_date: null,
    };
    assert.equal((await request("/api/experiences", {
      method: "POST",
      cookie: userCookie,
      body: { ...experienceFields, person_id: secondUserId },
    })).status, 400);
    const created = await request("/api/experiences", {
      method: "POST",
      cookie: userCookie,
      body: experienceFields,
    });
    assert.equal(created.status, 201);
    assert.equal(created.data.person_id, undefined);
    experienceId = created.data.id;
    assert.equal((await pool.query(
      "SELECT person_id FROM experiences WHERE id = $1",
      [experienceId],
    )).rows[0].person_id, userId);

    const ownList = await request("/api/experiences", { cookie: userCookie });
    assert.equal(ownList.status, 200);
    assert.ok(ownList.data.some((experience) => experience.id === experienceId));
    assert.deepEqual((await request("/api/experiences", { cookie: secondUserCookie })).data, []);
    assert.equal((await request(`/api/experiences/${experienceId}`, {
      method: "PATCH",
      cookie: secondUserCookie,
      body: { job_title: "Takeover" },
    })).status, 404);
    assert.equal((await request(`/api/experiences/${experienceId}`, {
      method: "DELETE",
      cookie: secondUserCookie,
    })).status, 404);
    const updated = await request(`/api/experiences/${experienceId}`, {
      method: "PATCH",
      cookie: userCookie,
      body: { job_title: "Senior Developer" },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.job_title, "Senior Developer");

    const addEndDate = await request(`/api/experiences/${experienceId}`, {
      method: "PATCH",
      cookie: userCookie,
      body: { end_date: "2024-03-01" },
    });
    assert.equal(addEndDate.status, 200);
    assert.equal((await request(`/api/experiences/${experienceId}`, {
      method: "PATCH",
      cookie: userCookie,
      body: { start_date: null },
    })).status, 400);
    const clearEndDate = await request(`/api/experiences/${experienceId}`, {
      method: "PATCH",
      cookie: userCookie,
      body: { end_date: null },
    });
    assert.equal(clearEndDate.status, 200);
    assert.equal(clearEndDate.data.end_date, null);
  });

  await t.test("every catalogue URL rejects visitors and USER accounts", async () => {
    for (const path of ["/api/admin/ads", "/api/companies", "/api/admin/companies", "/api/categories", "/api/admin/categories"]) {
      for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
        const route = ["PUT", "PATCH", "DELETE"].includes(method) ? `${path}/1` : path;
        assert.equal((await request(route, { method })).status, 401, `${method} ${route} visitor`);
        assert.equal((await request(route, { method, cookie: userCookie })).status, 403, `${method} ${route} USER`);
      }
    }
    // An admin role is assigned directly only in this isolated test database.
    const admin = await request("/api/auth/register", {
      method: "POST", body: { ...account, email: `admin-${Date.now()}@example.com` },
    });
    assert.equal(admin.status, 201);
    adminId = admin.data.id;
    await pool.query("UPDATE people SET role = 'ADMIN' WHERE id = $1", [adminId]);
    const login = await request("/api/auth/login", {
      method: "POST", body: { email: admin.data.email, password: account.password },
    });
    assert.equal(login.status, 200);
    assert.equal(login.data.role, "ADMIN");
    adminCookie = login.cookie;
  });

  await t.test("CV and dossier migrations preserve existing tables and can run twice", async () => {
    const tables = ["people", "companies", "categories", "ads", "applications", "projects",
      "experiences", "application_projects", "application_experiences"];
    const counts = async () => Promise.all(tables.map(async (table) =>
      (await pool.query(`SELECT COUNT(*) FROM ${table}`)).rows[0].count));
    const before = await counts();
    const migration = await fs.readFile(path.join(__dirname, "../../db/migrations/001_cv_documents.sql"), "utf8");
    await pool.query(migration);
    await pool.query(migration);
    assert.deepEqual(await counts(), before);
    const legacyDocument = await pool.query(
      `INSERT INTO cv_documents (person_id, original_name, storage_key, mime_type, size_bytes)
       VALUES ($1, 'ancien.pdf', 'b161c8f0-f6e8-4e77-9ca8-23d9a30b82aa.pdf', 'application/pdf', 4)
       RETURNING id`,
      [userId],
    );
    const cvMigration = await fs.readFile(path.join(__dirname, "../../db/migrations/002_current_cv.sql"), "utf8");
    await pool.query(cvMigration);
    await pool.query(cvMigration);
    assert.equal((await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cv_documents' AND column_name = 'is_current'")).rowCount, 1);
    assert.equal((await pool.query("SELECT is_current FROM cv_documents WHERE id = $1", [legacyDocument.rows[0].id])).rows[0].is_current, false);
    await pool.query("DELETE FROM cv_documents WHERE id = $1", [legacyDocument.rows[0].id]);

    // The loaded fresh schema already includes D5.3; remove its additions to simulate a D5.2 database.
    await pool.query(`
      ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_cv_document_owner;
      ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_submitted_snapshot_object_check;
      DROP INDEX IF EXISTS idx_applications_cv_document;
      ALTER TABLE applications DROP COLUMN IF EXISTS cv_document_id;
      ALTER TABLE applications DROP COLUMN IF EXISTS submitted_snapshot;
    `);
    const applicationCount = (await pool.query("SELECT COUNT(*) FROM applications")).rows[0].count;
    const dossierMigration = await fs.readFile(path.join(__dirname, "../../db/migrations/003_frozen_application_dossier.sql"), "utf8");
    await pool.query(dossierMigration);
    await pool.query(dossierMigration);
    assert.equal((await pool.query("SELECT COUNT(*) FROM applications")).rows[0].count, applicationCount);
    for (const column of ["cv_document_id", "submitted_snapshot"]) {
      assert.equal((await pool.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = $1",
        [column],
      )).rowCount, 1);
    }
    assert.equal((await pool.query("SELECT COUNT(*) FROM applications WHERE cv_document_id IS NOT NULL OR submitted_snapshot IS NOT NULL")).rows[0].count, "0");
  });

  async function uploadCv({ cookie = userCookie, bytes, name = "cv.pdf", type = "application/pdf", field = "file", extra, twice = false } = {}) {
    const form = new FormData();
    if (bytes !== undefined) {
      form.append(field, new Blob([bytes], { type }), name);
      if (twice) form.append(field, new Blob([bytes], { type }), name);
    }
    if (extra) form.append("person_id", String(secondUserId));
    const response = await fetch(`${baseUrl}/api/cv-documents`, {
      method: "POST", headers: cookie ? { Cookie: cookie } : {}, body: form,
    });
    return { status: response.status, data: await response.json() };
  }

  const pdf = await PDFDocument.create();
  pdf.addPage().drawText("Integration CV");
  const pdfBytes = await pdf.save();
  let cvId;

  await t.test("CV uploads reject visitors, invalid PDFs and oversized or unexpected fields", async () => {
    assert.equal((await uploadCv({ cookie: null, bytes: pdfBytes })).status, 401);
    assert.equal((await uploadCv()).status, 400);
    assert.equal((await uploadCv({ bytes: Buffer.alloc(0) })).status, 400);
    assert.equal((await uploadCv({ bytes: pdfBytes, type: "text/plain" })).status, 415);
    assert.equal((await uploadCv({ bytes: pdfBytes, name: "cv.txt" })).status, 415);
    assert.equal((await uploadCv({ bytes: Buffer.from("This is not a PDF") })).status, 400);
    assert.equal((await uploadCv({ bytes: Buffer.from("%PDF-1.7\nFake PDF\n%%EOF") })).status, 400);
    const emptyPdf = await PDFDocument.create();
    assert.equal((await uploadCv({ bytes: await emptyPdf.save({ addDefaultPage: false }) })).status, 400);
    assert.equal((await uploadCv({ bytes: Buffer.alloc(5 * 1024 * 1024 + 1) })).status, 413);
    assert.equal((await uploadCv({ bytes: pdfBytes, field: "cv" })).status, 400);
    assert.equal((await uploadCv({ bytes: pdfBytes, extra: true })).status, 400);
    assert.equal((await uploadCv({ bytes: pdfBytes, twice: true })).status, 400);
    assert.equal((await request("/api/cv-documents", { method: "POST", cookie: userCookie, body: {} })).status, 400);
    const malformed = await fetch(`${baseUrl}/api/cv-documents`, {
      method: "POST", headers: { Cookie: userCookie, "Content-Type": "multipart/form-data" }, body: "broken",
    });
    assert.equal(malformed.status, 400);
    assert.equal((await pool.query("SELECT id FROM cv_documents")).rowCount, 0);
    assert.deepEqual(await fs.readdir(cvStorageDir), []);
  });

  await t.test("CV upload stores private metadata and creates independent versions", async () => {
    const created = await uploadCv({ bytes: pdfBytes, name: "CV été.pdf" });
    assert.equal(created.status, 201);
    cvId = created.data.id;
    assert.equal(created.data.original_name, "CV été.pdf");
    assert.equal(created.data.mime_type, "application/pdf");
    assert.equal(created.data.size_bytes, pdfBytes.length);
    assert.equal(created.data.file_url, `/api/cv-documents/${cvId}/file`);
    assert.equal(created.data.storage_key, undefined);
    assert.equal(created.data.person_id, undefined);
    const stored = (await pool.query("SELECT * FROM cv_documents WHERE id = $1", [cvId])).rows[0];
    assert.equal(stored.person_id, userId);
    assert.match(stored.storage_key, /^[0-9a-f-]{36}\.pdf$/);
    assert.deepEqual(await fs.readFile(path.join(cvStorageDir, stored.storage_key)), Buffer.from(pdfBytes));
    assert.equal((await fs.stat(path.join(cvStorageDir, stored.storage_key))).mode & 0o777, 0o600);
    assert.equal((await request(`/storage/cv/${stored.storage_key}`)).status, 404);
    const versions = await Promise.all([uploadCv({ bytes: pdfBytes }), uploadCv({ bytes: pdfBytes })]);
    assert.ok(versions.every((version) => version.status === 201));
    assert.equal(new Set([cvId, ...versions.map((version) => version.data.id)]).size, 3);
    const documents = await pool.query("SELECT storage_key FROM cv_documents WHERE person_id = $1", [userId]);
    assert.equal(new Set(documents.rows.map((document) => document.storage_key)).size, 3);
    const current = await pool.query("SELECT id FROM cv_documents WHERE person_id = $1 AND is_current", [userId]);
    assert.equal(current.rowCount, 1);
    assert.ok([cvId, ...versions.map((version) => version.data.id)].includes(current.rows[0].id));
    const olderVersionId = [cvId, ...versions.map((version) => version.data.id)].find((id) => id !== current.rows[0].id);
    await assert.rejects(
      pool.query("UPDATE cv_documents SET is_current = TRUE WHERE id = $1", [olderVersionId]),
      (error) => error.code === "23505",
    );
  });

  await t.test("candidate can read, replace and remove only their current CV", async () => {
    assert.equal((await request("/api/cv-documents/current")).status, 401);
    const currentResponse = await request("/api/cv-documents/current", { cookie: userCookie });
    assert.equal(currentResponse.status, 200);
    assert.ok(currentResponse.data);
    assert.equal(currentResponse.data.storage_key, undefined);
    assert.equal((await request("/api/cv-documents/current", { cookie: secondUserCookie })).data, null);

    const replaced = await uploadCv({ bytes: pdfBytes, name: "cv-remplacement.pdf" });
    assert.equal(replaced.status, 201);
    assert.notEqual(replaced.data.id, currentResponse.data.id);
    assert.equal((await request("/api/cv-documents/current", { cookie: userCookie })).data.id, replaced.data.id);
    assert.equal((await request(`/api/cv-documents/${cvId}/file`, { cookie: userCookie })).status, 200);

    assert.equal((await request("/api/cv-documents/current", { method: "DELETE" })).status, 401);
    assert.equal((await request("/api/cv-documents/current", { method: "DELETE", cookie: secondUserCookie })).status, 204);
    assert.equal((await request("/api/cv-documents/current", { cookie: userCookie })).data.id, replaced.data.id);
    assert.equal((await request("/api/cv-documents/current", { method: "DELETE", cookie: userCookie })).status, 204);
    assert.equal((await request("/api/cv-documents/current", { cookie: userCookie })).data, null);
    assert.equal((await request(`/api/cv-documents/${replaced.data.id}/file`, { cookie: userCookie })).status, 200);
    const restored = await uploadCv({ bytes: pdfBytes, name: "cv-actuel.pdf" });
    assert.equal(restored.status, 201);
    assert.equal((await request("/api/cv-documents/current", { cookie: userCookie })).data.id, restored.data.id);

    const documents = await request("/api/cv-documents", { cookie: userCookie });
    assert.equal(documents.status, 200);
    assert.ok(documents.data.length >= 4);
    assert.equal(documents.data.find((document) => document.id === restored.data.id).is_current, true);
    assert.equal(documents.data.some((document) => document.storage_key), false);
    assert.equal((await request(`/api/cv-documents/${cvId}/current`, { method: "PUT" })).status, 401);
    assert.equal((await request("/api/cv-documents/not-an-id/current", { method: "PUT", cookie: userCookie })).status, 400);
    assert.equal((await request(`/api/cv-documents/${cvId}/current`, { method: "PUT", cookie: secondUserCookie })).status, 404);
    const chosen = await request(`/api/cv-documents/${cvId}/current`, { method: "PUT", cookie: userCookie });
    assert.equal(chosen.status, 200);
    assert.equal(chosen.data.is_current, true);
    assert.equal((await request("/api/cv-documents/current", { cookie: userCookie })).data.id, cvId);
  });

  await t.test("a candidate can store several private CV versions", async () => {
    const uploaded = await uploadCv({ cookie: secondUserCookie, bytes: pdfBytes, name: "autre-candidat.pdf" });
    assert.equal(uploaded.status, 201);
    secondCvId = uploaded.data.id;
    const list = await request("/api/cv-documents", { cookie: secondUserCookie });
    assert.equal(list.status, 200);
    assert.equal(list.data.length, 1);
    assert.equal(list.data[0].id, secondCvId);
    assert.equal((await request(`/api/cv-documents/${secondCvId}/current`, { method: "PUT", cookie: userCookie })).status, 404);
  });

  await t.test("CV files are readable only by their owner or a current ADMIN", async () => {
    const fileUrl = `/api/cv-documents/${cvId}/file`;
    assert.equal((await request(fileUrl)).status, 401);
    assert.equal((await request(fileUrl, { cookie: secondUserCookie })).status, 404);
    assert.equal((await request("/api/cv-documents/2147483647/file", { cookie: userCookie })).status, 404);
    for (const id of ["invalid", "0", "1e0", "2147483648"]) {
      assert.equal((await request(`/api/cv-documents/${id}/file`, { cookie: userCookie })).status, 400);
    }
    for (const cookie of [userCookie, adminCookie]) {
      const response = await fetch(`${baseUrl}${fileUrl}`, { headers: { Cookie: cookie } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "application/pdf");
      assert.match(response.headers.get("content-disposition"), /^inline/);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), Buffer.from(pdfBytes));
    }
    const download = await fetch(`${baseUrl}${fileUrl}?download=1`, { headers: { Cookie: userCookie } });
    assert.match(download.headers.get("content-disposition"), /^attachment/);
    await download.arrayBuffer();
    await pool.query("UPDATE people SET role = 'USER' WHERE id = $1", [adminId]);
    try {
      assert.equal((await request(fileUrl, { cookie: adminCookie })).status, 404);
    } finally {
      await pool.query("UPDATE people SET role = 'ADMIN' WHERE id = $1", [adminId]);
    }
    const missing = await uploadCv({ bytes: pdfBytes });
    const stored = (await pool.query("SELECT storage_key FROM cv_documents WHERE id = $1", [missing.data.id])).rows[0];
    await fs.unlink(path.join(cvStorageDir, stored.storage_key));
    const response = await fetch(`${baseUrl}/api/cv-documents/${missing.data.id}/file`, { headers: { Cookie: userCookie } });
    assert.equal(response.status, 404);
    assert.match(response.headers.get("content-type"), /application\/json/);
    assert.equal(response.headers.get("content-disposition"), null);
    assert.match((await response.json()).message, /indisponible/);
  });

  await t.test("a failed CV SQL insert removes its file and Swagger describes CV routes", async () => {
    const before = await fs.readdir(cvStorageDir);
    const count = (await pool.query("SELECT COUNT(*) FROM cv_documents")).rows[0].count;
    const currentBeforeFailure = (await pool.query("SELECT id FROM cv_documents WHERE person_id = $1 AND is_current", [userId])).rows[0]?.id;
    // Force a real SQL failure in the isolated test database to check compensation.
    await pool.query(`CREATE FUNCTION reject_test_cv() RETURNS trigger LANGUAGE plpgsql AS
      $$ BEGIN RAISE EXCEPTION 'Forced CV test failure'; END $$;
      CREATE TRIGGER reject_test_cv BEFORE INSERT ON cv_documents
      FOR EACH ROW EXECUTE FUNCTION reject_test_cv()`);
    try {
      assert.equal((await uploadCv({ bytes: pdfBytes })).status, 500);
      assert.deepEqual(await fs.readdir(cvStorageDir), before);
      assert.equal((await pool.query("SELECT COUNT(*) FROM cv_documents")).rows[0].count, count);
      assert.equal((await pool.query("SELECT id FROM cv_documents WHERE person_id = $1 AND is_current", [userId])).rows[0]?.id, currentBeforeFailure);
    } finally {
      await pool.query("DROP TRIGGER reject_test_cv ON cv_documents; DROP FUNCTION reject_test_cv()");
    }
    const swagger = await request("/api-docs/openapi.json");
    assert.equal(swagger.status, 200);
    assert.ok(swagger.data.paths["/api/cv-documents"].post.requestBody.content["multipart/form-data"]);
    assert.ok(swagger.data.paths["/api/cv-documents/current"].get.security);
    assert.ok(swagger.data.paths["/api/cv-documents/current"].delete.security);
    assert.ok(swagger.data.paths["/api/cv-documents"].get.security);
    assert.ok(swagger.data.paths["/api/cv-documents/{id}/current"].put.security);
    assert.ok(swagger.data.paths["/api/cv-documents/{id}/file"].get.security);
    assert.ok(swagger.data.paths["/api/applications/today"].get.security);
    assert.ok(swagger.data.paths["/api/applications/mine/{id}"].get.security);
    assert.deepEqual(swagger.data.paths["/api/applications"].post.requestBody.content["application/json"].schema.required, ["ad_id", "message"]);
    assert.ok(swagger.data.components.schemas.CvDocument);
  });

  await t.test("CV cleanup removes only old files with no metadata", async () => {
    const path = require("node:path");
    const { randomUUID } = require("node:crypto");
    const { cleanupUnusedCvFiles } = require("../src/services/cv_storage_cleanup");
    const cleanupDir = path.join(cvStorageDir, "cleanup-fixture");
    await fs.mkdir(cleanupDir);

    const referenced = (await pool.query(
      "SELECT storage_key FROM cv_documents WHERE id = $1",
      [cvId],
    )).rows[0].storage_key;
    const oldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const referencedPath = path.join(cleanupDir, referenced);
    await fs.copyFile(path.join(cvStorageDir, referenced), referencedPath);
    await fs.utimes(referencedPath, oldDate, oldDate);

    const orphanName = `${randomUUID()}.pdf`;
    const orphanPath = path.join(cleanupDir, orphanName);
    await fs.writeFile(orphanPath, "orphan");
    await fs.utimes(orphanPath, oldDate, oldDate);

    const recentName = `${randomUUID()}.pdf`;
    const recentPath = path.join(cleanupDir, recentName);
    await fs.writeFile(recentPath, "recent orphan");
    const invalidPath = path.join(cleanupDir, "notes.txt");
    await fs.writeFile(invalidPath, "leave unrelated files alone");
    const linkPath = path.join(cleanupDir, `${randomUUID()}.pdf`);
    await fs.symlink(orphanPath, linkPath);

    const { removedCount } = await cleanupUnusedCvFiles({ storageDir: cleanupDir });
    assert.equal(removedCount, 1);
    await assert.rejects(fs.stat(orphanPath), (error) => error.code === "ENOENT");
    for (const retainedPath of [referencedPath, recentPath, invalidPath, linkPath]) {
      await fs.lstat(retainedPath);
    }
  });

  await t.test("company CRUD works with both URL forms", async () => {
    const company = await request("/api/companies", {
      method: "POST", cookie: adminCookie, body: { name: "Integration Company", location: "Paris" },
    });
    assert.equal(company.status, 201);
    companyId = company.data.id;
    const updated = await request(`/api/admin/companies/${companyId}`, {
      method: "PUT", cookie: adminCookie, body: { name: "Integration Company Updated", location: "Lyon", description: "Une équipe de test.", website: "https://company.example", logo_url: "https://company.example/logo.png" },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.name, "Integration Company Updated");
    assert.equal((await request(`/api/companies/${companyId}`, { cookie: adminCookie })).data.location, "Lyon");
    const unused = await request("/api/admin/companies", {
      method: "POST", cookie: adminCookie, body: { name: "Unused Test Company" },
    });
    assert.equal(unused.status, 201);
    assert.equal((await request(`/api/companies/${unused.data.id}`, { method: "DELETE", cookie: adminCookie })).status, 204);
  });

  await t.test("category CRUD validates names and persists renaming", async () => {
    const created = await request("/api/categories", {
      method: "POST", cookie: adminCookie, body: { name: `Integration Category ${Date.now()}` },
    });
    assert.equal(created.status, 201);
    categoryId = created.data.id;
    const renamed = await request(`/api/admin/categories/${categoryId}`, {
      method: "PATCH", cookie: adminCookie, body: { name: `${created.data.name} Updated` },
    });
    assert.equal(renamed.status, 200);
    const list = await request("/api/categories", { cookie: adminCookie });
    assert.equal(list.status, 200);
    assert.ok(list.data.some((category) => category.name === renamed.data.name));
    assert.equal((await request("/api/categories", {
      method: "POST", cookie: adminCookie, body: { name: renamed.data.name },
    })).status, 409);
  });

  await t.test("admin ads include closed offers while public ads show published offers", async () => {
    const fields = {
      title: "Integration Published Offer", description: "A real SQL test offer.",
      company_id: companyId, category_id: categoryId, location: "Lyon",
      salary_min: 30000, salary_max: 40000, salary_period: "year",
      contract_type: "permanent", working_time: "full_time", status: "published",
    };
    const published = await request("/api/admin/ads", { method: "POST", cookie: adminCookie, body: fields });
    assert.equal(published.status, 201);
    publishedId = published.data.id;
    const closed = await request("/api/admin/ads", {
      method: "POST", cookie: adminCookie, body: { ...fields, title: "Integration Closed Offer", status: "closed" },
    });
    assert.equal(closed.status, 201);
    closedId = closed.data.id;
    const publicList = await request("/api/ads");
    assert.equal(publicList.status, 200);
    assert.ok(publicList.data.some((ad) => ad.id === publishedId));
    assert.ok(publicList.data.every((ad) => ad.status === "published" && ad.id !== closedId));
    const detail = await request(`/api/ads/${publishedId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.data.company_name, "Integration Company Updated");
    assert.equal(detail.data.salary_min, 30000);
    assert.equal((await request(`/api/ads/${closedId}`)).status, 404);
    assert.equal((await request("/api/ads/2147483647")).status, 404);
    assert.equal((await request("/api/ads/invalid")).status, 400);
    const adminList = await request("/api/admin/ads", { cookie: adminCookie });
    assert.equal(adminList.status, 200);
    assert.ok(adminList.data.some((ad) => ad.id === closedId));
  });

  await t.test("public catalogue exposes useful fields and has no write routes", async () => {
    const companies = await request("/api/public/companies");
    assert.equal(companies.status, 200);
    const company = companies.data.find((item) => item.id === companyId);
    assert.deepEqual(Object.keys(company).sort(), ["description", "id", "location", "logo_url", "name", "website"]);
    assert.equal(company.description, "Une équipe de test.");
    const categories = await request("/api/public/categories");
    assert.equal(categories.status, 200);
    assert.ok(categories.data.some((item) => item.id === categoryId));
    const detail = await request(`/api/ads/${publishedId}`);
    for (const field of ["description", "location", "website", "logo_url"]) {
      assert.equal(detail.data[`company_${field}`], company[field]);
    }
    for (const path of ["/api/public/companies", "/api/public/categories"]) {
      for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
        const route = method === "POST" ? path : `${path}/${companyId}`;
        for (const cookie of [undefined, userCookie]) {
          const response = await fetch(`${baseUrl}${route}`, { method, headers: cookie ? { Cookie: cookie } : {} });
          assert.equal(response.status, 404);
        }
      }
    }
    assert.equal((await pool.query("SELECT id FROM companies WHERE id = $1", [companyId])).rowCount, 1);
    assert.equal((await pool.query("SELECT id FROM categories WHERE id = $1", [categoryId])).rowCount, 1);
  });

  await t.test("public search combines filters, validates parameters and paginates", async () => {
    const filters = `q=INTEGRATION&location=lyON&company_id=${companyId}&category_id=${categoryId}&contract_type=permanent`;
    const found = await request(`/api/ads?${filters}&page=1&page_size=1`);
    assert.equal(found.status, 200);
    assert.equal(found.data.total, 1);
    assert.equal(found.data.total_pages, 1);
    assert.equal(found.data.page_size, 1);
    assert.equal(found.data.ads[0].id, publishedId);
    assert.ok(found.data.ads.every((ad) => ad.status === "published"));
    assert.ok(Array.isArray((await request(`/api/ads?${filters}`)).data));
    const empty = await request(`/api/ads?${filters}&page=2&page_size=1`);
    assert.equal(empty.data.total, 1);
    assert.equal(empty.data.page, 2);
    assert.deepEqual(empty.data.ads, []);
    const missing = await request(`/api/ads?${filters}&q=does-not-exist&page=1`);
    // Les paramètres répétés sont refusés, au lieu de choisir arbitrairement une valeur.
    assert.equal(missing.status, 400);
    const noResults = await request(`/api/ads?company_id=${companyId}&q=does-not-exist&page=1`);
    assert.equal(noResults.data.total, 0);
    assert.equal(noResults.data.total_pages, 0);
    assert.deepEqual(noResults.data.ads, []);
    for (const [name, value] of [["q", "absent"], ["location", "absent"], ["company_id", "2147483647"], ["category_id", "2147483647"], ["contract_type", "apprenticeship"]]) {
      const changed = new URLSearchParams(filters);
      changed.set(name, value);
      changed.set("page", "1");
      const response = await request(`/api/ads?${changed}`);
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 0, `Le filtre ${name} doit être appliqué`);
    }
    for (const query of ["page=0", "page=-1", "page=1.5", "page=1e2", "page_size=101", "page_size=0", "page=2147483648", "company_id=abc", "category_id=0", "sort=DROP%20TABLE", "sort=toString", "contract_type=invalid", "q=", "q=a&q=b", `q=${"a".repeat(256)}`, "status=closed"]) {
      const response = await request(`/api/ads?${query}`);
      assert.equal(response.status, 400, query);
      assert.ok(response.data.message);
    }
    for (const text of ["%", "_", "\\", "' OR 1=1 --"]) {
      const response = await request(`/api/ads?company_id=${companyId}&q=${encodeURIComponent(text)}&page=1`);
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 0);
    }
  });

  await t.test("salary sorting annualizes monthly amounts and puts missing salaries last", async () => {
    const ids = [];
    for (const salary of [
      { salary_min: 36000, salary_max: 90000, salary_period: "year" },
      { salary_min: 4000, salary_period: "month" },
      { salary_max: 42000, salary_period: "year" },
      { salary_period: "year" },
      { salary_min: 36000, salary_period: "year" },
    ]) {
      const created = await request("/api/admin/ads", {
        method: "POST", cookie: adminCookie,
        body: { title: "Salary test", description: "Salary sorting test", company_id: companyId, status: "published", ...salary },
      });
      assert.equal(created.status, 201, created.data.message);
      ids.push(created.data.id);
    }
    try {
      await pool.query("UPDATE ads SET created_at = '2026-01-01T00:00:00Z' WHERE company_id = $1", [companyId]);
      const prefix = `/api/ads?company_id=${companyId}&page_size=100`;
      const descending = await request(`${prefix}&sort=salary_desc`);
      assert.equal(descending.data.total, 6);
      assert.deepEqual(descending.data.ads.map((ad) => ad.id), [ids[1], ids[2], ids[4], ids[0], publishedId, ids[3]]);
      const ascending = await request(`${prefix}&sort=salary_asc`);
      assert.deepEqual(ascending.data.ads.map((ad) => ad.id), [publishedId, ids[4], ids[0], ids[2], ids[1], ids[3]]);
      const recent = await request(`${prefix}&sort=recent`);
      assert.deepEqual(recent.data.ads.map((ad) => ad.id), [...ids].reverse().concat(publishedId));
      const first = await request(`/api/ads?company_id=${companyId}&page=1&page_size=2&sort=salary_desc`);
      const second = await request(`/api/ads?company_id=${companyId}&page=2&page_size=2&sort=salary_desc`);
      assert.equal(first.data.total_pages, 3);
      assert.deepEqual(first.data.ads.map((ad) => ad.id), [ids[1], ids[2]]);
      assert.deepEqual(second.data.ads.map((ad) => ad.id), [ids[4], ids[0]]);
    } finally {
      await pool.query("DELETE FROM ads WHERE id = ANY($1::integer[])", [ids]);
    }
  });

  await t.test("applications use the session identity and reject invalid submissions", async () => {
    const body = { ad_id: publishedId, message: "I would like to join your team.", person_id: adminId };
    assert.equal((await request("/api/applications", { method: "POST", body })).status, 401);
    assert.equal((await request("/api/applications/today")).status, 401);
    assert.equal((await request("/api/applications/today", { cookie: userCookie })).data.count, 0);
    assert.equal((await request("/api/applications", {
      method: "POST", cookie: userCookie, body: { ...body, project_ids: [projectId, projectId] },
    })).status, 400);
    assert.equal((await request("/api/applications", {
      method: "POST", cookie: userCookie, body: { ...body, project_ids: [999999] },
    })).status, 400);

    const submittedBody = {
      ...body,
      project_ids: [projectId],
      experience_ids: [experienceId],
    };
    const created = await request("/api/applications", { method: "POST", cookie: userCookie, body: submittedBody });
    assert.equal(created.status, 201);
    applicationId = created.data.id;
    assert.equal(created.data.status, "sent");
    const saved = await pool.query("SELECT person_id, ad_id, message, cv_document_id, submitted_snapshot FROM applications WHERE id = $1", [created.data.id]);
    assert.equal(saved.rows[0].person_id, userId);
    assert.equal(saved.rows[0].ad_id, publishedId);
    assert.equal(saved.rows[0].message, submittedBody.message);
    assert.equal(saved.rows[0].cv_document_id, null);
    assert.deepEqual(saved.rows[0].submitted_snapshot.person, {
      first_name: "Updated",
      last_name: "Candidate",
      email: account.email,
      phone: "0612345678",
    });
    assert.equal(saved.rows[0].submitted_snapshot.message, submittedBody.message);
    assert.equal(saved.rows[0].submitted_snapshot.projects[0].title, "Portfolio updated");
    assert.equal(saved.rows[0].submitted_snapshot.experiences[0].job_title, "Senior Developer");
    assert.equal((await request("/api/applications/today", { cookie: userCookie })).data.count, 1);
    assert.equal((await pool.query("SELECT project_id FROM application_projects WHERE application_id = $1", [applicationId])).rows[0].project_id, projectId);
    assert.equal((await pool.query("SELECT experience_id FROM application_experiences WHERE application_id = $1", [applicationId])).rows[0].experience_id, experienceId);

    assert.equal((await request(`/api/applications/mine/${applicationId}`)).status, 401);
    const privateDetail = await request(`/api/applications/mine/${applicationId}`, { cookie: secondUserCookie });
    assert.equal(privateDetail.status, 404);
    assert.equal((await request("/api/applications/mine/not-an-id", { cookie: userCookie })).status, 400);

    const detail = await request(`/api/applications/mine/${applicationId}`, { cookie: userCookie });
    assert.equal(detail.status, 200);
    assert.equal(detail.data.snapshot_available, true);
    assert.equal(detail.data.submitted_snapshot.person.first_name, "Updated");
    assert.equal(detail.data.submitted_snapshot.projects[0].title, "Portfolio updated");
    assert.equal(detail.data.cv, null);

    await request("/api/people/me", {
      method: "PATCH", cookie: userCookie, body: { first_name: "Changed later" },
    });
    await request(`/api/projects/${projectId}`, {
      method: "PATCH", cookie: userCookie, body: { title: "Changed later" },
    });
    await request(`/api/experiences/${experienceId}`, {
      method: "PATCH", cookie: userCookie, body: { job_title: "Changed later" },
    });
    const unchangedDetail = await request(`/api/applications/mine/${applicationId}`, { cookie: userCookie });
    assert.equal(unchangedDetail.data.submitted_snapshot.person.first_name, "Updated");
    assert.equal(unchangedDetail.data.submitted_snapshot.projects[0].title, "Portfolio updated");
    assert.equal(unchangedDetail.data.submitted_snapshot.experiences[0].job_title, "Senior Developer");

    await request("/api/people/me", {
      method: "PATCH", cookie: userCookie, body: { first_name: "Updated" },
    });
    await request(`/api/projects/${projectId}`, {
      method: "PATCH", cookie: userCookie, body: { title: "Portfolio updated" },
    });
    await request(`/api/experiences/${experienceId}`, {
      method: "PATCH", cookie: userCookie, body: { job_title: "Senior Developer" },
    });

    const legacyResult = await pool.query(
      `INSERT INTO applications (person_id, ad_id, message, cv_document_id)
       VALUES ($1, $2, 'Ancienne candidature', $3) RETURNING id`,
      [userId, closedId, cvId],
    );
    const legacyId = legacyResult.rows[0].id;
    try {
      await pool.query(
        `INSERT INTO application_projects (application_id, project_id, person_id)
         VALUES ($1, $2, $3)`,
        [legacyId, projectId, userId],
      );
      const legacyDetail = await request(`/api/applications/mine/${legacyId}`, { cookie: userCookie });
      assert.equal(legacyDetail.status, 200);
      assert.equal(legacyDetail.data.snapshot_available, false);
      assert.equal(legacyDetail.data.legacy_message, "Ancienne candidature");
      assert.equal(legacyDetail.data.legacy_items.projects[0].title, "Portfolio updated");
      assert.equal(legacyDetail.data.cv.id, cvId);
    } finally {
      await pool.query("DELETE FROM applications WHERE id = $1", [legacyId]);
    }

    assert.equal((await request("/api/applications", { method: "POST", cookie: userCookie, body: submittedBody })).status, 409);
    for (const [adId, expectedStatus] of [[closedId, 409], [2147483647, 404], ["invalid", 400]]) {
      assert.equal((await request("/api/applications", {
        method: "POST", cookie: userCookie, body: { ...submittedBody, ad_id: adId },
      })).status, expectedStatus);
    }
    assert.equal((await request("/api/applications", {
      method: "POST", cookie: userCookie, body: { ...submittedBody, message: " " },
    })).status, 400);

    const optionalOffer = await request("/api/admin/ads", {
      method: "POST", cookie: adminCookie,
      body: { title: "Optional CV test", description: "A temporary application offer.", company_id: companyId, salary_period: "year", status: "published" },
    });
    assert.equal(optionalOffer.status, 201);
    let attachedApplicationId;
    try {
      const foreignCv = await request("/api/applications", {
        method: "POST", cookie: userCookie,
        body: { ad_id: optionalOffer.data.id, cv_document_id: secondCvId, message: "CV d’un autre compte." },
      });
      assert.equal(foreignCv.status, 400);
      assert.equal((await pool.query("SELECT id FROM applications WHERE ad_id = $1", [optionalOffer.data.id])).rowCount, 0);

      const attachedApplication = await request("/api/applications", {
        method: "POST", cookie: userCookie,
        body: { ad_id: optionalOffer.data.id, cv_document_id: cvId, message: "Avec mon CV." },
      });
      assert.equal(attachedApplication.status, 201);
      attachedApplicationId = attachedApplication.data.id;
      assert.equal(attachedApplication.data.cv_document_id, cvId);
      const attachedRow = await pool.query(
        "SELECT submitted_snapshot FROM applications WHERE id = $1",
        [attachedApplicationId],
      );
      assert.equal(attachedRow.rows[0].submitted_snapshot.cv.id, cvId);
      assert.equal(attachedRow.rows[0].submitted_snapshot.cv.original_name, "CV été.pdf");
      const attachedDetail = await request(`/api/applications/mine/${attachedApplicationId}`, { cookie: userCookie });
      assert.equal(attachedDetail.data.cv.id, cvId);
      assert.equal(attachedDetail.data.cv.file_url, `/api/cv-documents/${cvId}/file`);
      assert.equal((await request("/api/applications/today", { cookie: userCookie })).data.count, 2);
    } finally {
      if (attachedApplicationId) await pool.query("DELETE FROM applications WHERE id = $1", [attachedApplicationId]);
      await pool.query("DELETE FROM ads WHERE id = $1", [optionalOffer.data.id]);
    }

    const raceOffer = await request("/api/admin/ads", {
      method: "POST", cookie: adminCookie,
      body: { title: "Concurrent application test", description: "Only one application should be saved.", company_id: companyId, salary_period: "year", status: "published" },
    });
    assert.equal(raceOffer.status, 201);
    try {
      const concurrentRequests = await Promise.all([
        request("/api/applications", {
          method: "POST", cookie: userCookie,
          body: { ad_id: raceOffer.data.id, message: "Envoi concurrent numéro un." },
        }),
        request("/api/applications", {
          method: "POST", cookie: userCookie,
          body: { ad_id: raceOffer.data.id, message: "Envoi concurrent numéro deux." },
        }),
      ]);
      assert.deepEqual(concurrentRequests.map((response) => response.status).sort(), [201, 409]);
      assert.equal((await pool.query(
        "SELECT id FROM applications WHERE ad_id = $1",
        [raceOffer.data.id],
      )).rowCount, 1);
    } finally {
      await pool.query("DELETE FROM applications WHERE ad_id = $1", [raceOffer.data.id]);
      await pool.query("DELETE FROM ads WHERE id = $1", [raceOffer.data.id]);
    }

    const closingOffer = await request("/api/admin/ads", {
      method: "POST", cookie: adminCookie,
      body: { title: "Offer closing test", description: "Cannot accept an application after closing.", company_id: companyId, salary_period: "year", status: "published" },
    });
    assert.equal(closingOffer.status, 201);
    const lockClient = await pool.connect();
    let lockTransactionOpen = false;
    try {
      await lockClient.query("BEGIN");
      lockTransactionOpen = true;
      await lockClient.query("SELECT id FROM ads WHERE id = $1 FOR UPDATE", [closingOffer.data.id]);

      const pendingApplication = request("/api/applications", {
        method: "POST", cookie: userCookie,
        body: { ad_id: closingOffer.data.id, message: "Je postule pendant la fermeture." },
      });
      let waitsForOfferLock = false;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const waitingQuery = await pool.query(
          `SELECT 1
           FROM pg_stat_activity
           WHERE datname = current_database()
             AND pid <> pg_backend_pid()
             AND wait_event_type = 'Lock'
             AND query LIKE 'SELECT id, status FROM ads%'
           LIMIT 1`,
        );
        if (waitingQuery.rowCount) {
          waitsForOfferLock = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.equal(waitsForOfferLock, true, "the application must wait for the offer update lock");

      await lockClient.query("UPDATE ads SET status = 'closed' WHERE id = $1", [closingOffer.data.id]);
      await lockClient.query("COMMIT");
      lockTransactionOpen = false;
      assert.equal((await pendingApplication).status, 409);
      assert.equal((await pool.query("SELECT id FROM applications WHERE ad_id = $1", [closingOffer.data.id])).rowCount, 0);
    } finally {
      if (lockTransactionOpen) await lockClient.query("ROLLBACK");
      lockClient.release();
      await pool.query("DELETE FROM applications WHERE ad_id = $1", [closingOffer.data.id]);
      await pool.query("DELETE FROM ads WHERE id = $1", [closingOffer.data.id]);
    }

    assert.equal((await request("/api/applications/today", { cookie: userCookie })).data.count, 1);
  });

  await t.test("submitted dossiers stay frozen and enforce owned CV references", async () => {
    const savedApplication = await pool.query(
      "SELECT cv_document_id, submitted_snapshot FROM applications WHERE id = $1",
      [applicationId],
    );
    assert.equal(savedApplication.rows[0].cv_document_id, null);
    assert.ok(savedApplication.rows[0].submitted_snapshot);

    await assert.rejects(
      pool.query("UPDATE applications SET cv_document_id = $1 WHERE id = $2", [secondCvId, applicationId]),
      (error) => error.code === "23503",
    );
    const snapshot = {
      person: { first_name: "Integration", last_name: "Candidate", email: account.email, phone: null },
      message: "Ma candidature figée.",
      projects: [{ id: projectId, title: "Projet conservé", description: "Copié au dépôt." }],
      experiences: [{ id: experienceId, company: "Entreprise", position: "Développeur" }],
    };
    await pool.query(
      "UPDATE applications SET cv_document_id = $1, submitted_snapshot = $2 WHERE id = $3",
      [cvId, JSON.stringify(snapshot), applicationId],
    );
    const saved = await pool.query(
      "SELECT cv_document_id, submitted_snapshot FROM applications WHERE id = $1",
      [applicationId],
    );
    assert.equal(saved.rows[0].cv_document_id, cvId);
    assert.deepEqual(saved.rows[0].submitted_snapshot, snapshot);
    await assert.rejects(
      pool.query("UPDATE applications SET submitted_snapshot = $1 WHERE id = $2", [JSON.stringify(["pas", "un objet"]), applicationId]),
      (error) => error.code === "23514",
    );

    assert.equal((await request("/api/cv-documents/current", { method: "DELETE", cookie: userCookie })).status, 204);
    assert.equal((await request("/api/cv-documents/current", { cookie: userCookie })).data, null);
    assert.equal((await pool.query("SELECT cv_document_id FROM applications WHERE id = $1", [applicationId])).rows[0].cv_document_id, cvId);
    assert.equal((await request(`/api/cv-documents/${cvId}/file`, { cookie: userCookie })).status, 200);
    assert.equal((await request(`/api/cv-documents/${cvId}/file`, { cookie: adminCookie })).status, 200);
    assert.equal((await pool.query("SELECT is_current FROM cv_documents WHERE id = $1", [cvId])).rows[0].is_current, false);
  });

  await t.test("linked projects and experiences cannot be deleted", async (subtest) => {
    if (!applicationId || !projectId || !experienceId) {
      subtest.skip("requires the application and candidate items to be created first");
      return;
    }
    const projectDelete = await request(`/api/projects/${projectId}`, {
      method: "DELETE",
      cookie: userCookie,
    });
    assert.equal(projectDelete.status, 409);
    const experienceDelete = await request(`/api/experiences/${experienceId}`, {
      method: "DELETE",
      cookie: userCookie,
    });
    assert.equal(experienceDelete.status, 409);
    assert.equal((await pool.query(
      "SELECT 1 FROM application_projects WHERE project_id = $1",
      [projectId],
    )).rowCount, 1);
    assert.equal((await pool.query(
      "SELECT 1 FROM application_experiences WHERE experience_id = $1",
      [experienceId],
    )).rowCount, 1);

    const otherProject = await request("/api/projects", {
      method: "POST",
      cookie: secondUserCookie,
      body: { title: "Temporary project" },
    });
    assert.equal(otherProject.status, 201);
    assert.equal((await request(`/api/projects/${otherProject.data.id}`, {
      method: "DELETE",
      cookie: secondUserCookie,
    })).status, 204);
  });

  await t.test("closing and reopening an offer controls public visibility and applications", async () => {
    assert.equal((await request(`/api/admin/ads/${publishedId}`, {
      method: "PATCH", cookie: adminCookie, body: { status: "closed" },
    })).status, 200);
    assert.equal((await request(`/api/ads/${publishedId}`)).status, 404);
    assert.equal((await request("/api/applications", {
      method: "POST", cookie: userCookie, body: { ad_id: publishedId, message: "Test after closure" },
    })).status, 409);
    assert.equal((await request(`/api/admin/ads/${publishedId}`, {
      method: "PATCH", cookie: adminCookie, body: { status: "published" },
    })).status, 200);
    assert.equal((await request(`/api/ads/${publishedId}`)).status, 200);
  });

  await t.test("editing an offer persists its content and validates status changes", async () => {
    const updated = await request(`/api/admin/ads/${publishedId}`, {
      method: "PATCH", cookie: adminCookie,
      body: { title: "Updated Integration Offer", description: "Updated SQL description." },
    });
    assert.equal(updated.status, 200);
    const saved = await pool.query("SELECT title, description, status FROM ads WHERE id = $1", [publishedId]);
    assert.deepEqual(saved.rows[0], {
      title: "Updated Integration Offer", description: "Updated SQL description.", status: "published",
    });
    assert.equal((await request(`/api/ads/${publishedId}`)).data.title, saved.rows[0].title);
    for (const body of [{}, { status: "draft" }]) {
      assert.equal((await request(`/api/admin/ads/${publishedId}`, {
        method: "PATCH", cookie: adminCookie, body,
      })).status, 400);
    }
  });

  await t.test("offer deletion refuses linked applications and preserves SQL relations", async () => {
    const applicationsBefore = await pool.query("SELECT * FROM applications WHERE ad_id = $1", [publishedId]);
    assert.ok(applicationsBefore.rowCount > 0);
    for (const status of ["published", "closed"]) {
      assert.equal((await request(`/api/admin/ads/${publishedId}`, {
        method: "PATCH", cookie: adminCookie, body: { status },
      })).status, 200);
      const refused = await request(`/api/admin/ads/${publishedId}`, { method: "DELETE", cookie: adminCookie });
      assert.equal(refused.status, 409);
      assert.match(refused.data.message, /candidatures/);
      assert.equal((await request(`/api/admin/ads/${publishedId}`, { cookie: adminCookie })).status, 200);
      const applicationsAfter = await pool.query("SELECT * FROM applications WHERE ad_id = $1", [publishedId]);
      assert.deepEqual(applicationsAfter.rows, applicationsBefore.rows);
    }
    assert.equal((await request(`/api/admin/ads/${publishedId}`, {
      method: "PATCH", cookie: adminCookie, body: { status: "published" },
    })).status, 200);
    assert.equal((await request("/api/admin/ads/invalid", { method: "DELETE", cookie: adminCookie })).status, 400);
    assert.equal((await request("/api/admin/ads/2147483647", { method: "DELETE", cookie: adminCookie })).status, 404);

    const removed = await request(`/api/admin/ads/${closedId}`, { method: "DELETE", cookie: adminCookie });
    assert.equal(removed.status, 204);
    assert.equal(removed.data, null);
    assert.equal((await pool.query("SELECT id FROM ads WHERE id = $1", [closedId])).rowCount, 0);
    assert.equal((await request(`/api/admin/ads/${closedId}`, { cookie: adminCookie })).status, 404);
    assert.equal((await request(`/api/admin/ads/${closedId}`, { method: "DELETE", cookie: adminCookie })).status, 404);

    const unused = await request("/api/admin/ads", {
      method: "POST", cookie: adminCookie,
      body: { title: "Unused Published Offer", description: "No applications.", company_id: companyId, salary_period: "year", status: "published" },
    });
    assert.equal(unused.status, 201);
    assert.equal((await request(`/api/admin/ads/${unused.data.id}`, { method: "DELETE", cookie: adminCookie })).status, 204);
    assert.equal((await request(`/api/ads/${unused.data.id}`)).status, 404);
    const adminList = await request("/api/admin/ads", { cookie: adminCookie });
    assert.equal(adminList.status, 200);
    assert.ok(adminList.data.every((ad) => ad.id !== closedId && ad.id !== unused.data.id));
  });

  await t.test("catalogue deletions respect linked data", async () => {
    assert.equal((await request(`/api/companies/${companyId}`, { method: "DELETE", cookie: adminCookie })).status, 409);
    assert.equal((await request(`/api/categories/${categoryId}`, { method: "DELETE", cookie: adminCookie })).status, 204);
    const detail = await request(`/api/ads/${publishedId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.data.category_id, null);
  });

  await t.test("a role change takes effect on an existing admin session", async () => {
    await pool.query("UPDATE people SET role = 'USER' WHERE id = $1", [adminId]);
    assert.equal((await request("/api/admin/ads", { cookie: adminCookie })).status, 403);
  });

  await t.test("logout blocks profile and application requests", async () => {
    assert.equal((await request("/api/auth/logout", { method: "POST", cookie: userCookie })).status, 200);
    assert.equal((await request("/api/auth/me", { cookie: userCookie })).status, 401);
    assert.equal((await request("/api/applications", {
      method: "POST", cookie: userCookie, body: { ad_id: publishedId, message: "Test after logout" },
    })).status, 401);
  });
});
