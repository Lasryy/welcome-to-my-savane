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

  await t.test("company CRUD works with both URL forms", async () => {
    const company = await request("/api/companies", {
      method: "POST", cookie: adminCookie, body: { name: "Integration Company", location: "Paris" },
    });
    assert.equal(company.status, 201);
    companyId = company.data.id;
    const updated = await request(`/api/admin/companies/${companyId}`, {
      method: "PUT", cookie: adminCookie, body: { name: "Integration Company Updated", location: "Lyon" },
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

  await t.test("applications use the session identity and reject invalid submissions", async () => {
    const body = { ad_id: publishedId, message: "I would like to join your team.", person_id: adminId };
    assert.equal((await request("/api/applications", { method: "POST", body })).status, 401);
    const created = await request("/api/applications", { method: "POST", cookie: userCookie, body });
    assert.equal(created.status, 201);
    applicationId = created.data.id;
    assert.equal(created.data.status, "sent");
    const saved = await pool.query("SELECT person_id, ad_id, message FROM applications WHERE id = $1", [created.data.id]);
    assert.equal(saved.rows[0].person_id, userId);
    assert.equal(saved.rows[0].ad_id, publishedId);
    assert.equal(saved.rows[0].message, body.message);
    assert.equal((await request("/api/applications", { method: "POST", cookie: userCookie, body })).status, 409);
    for (const [adId, expectedStatus] of [[closedId, 409], [2147483647, 404], ["invalid", 400]]) {
      assert.equal((await request("/api/applications", {
        method: "POST", cookie: userCookie, body: { ...body, ad_id: adId },
      })).status, expectedStatus);
    }
    assert.equal((await request("/api/applications", {
      method: "POST", cookie: userCookie, body: { ...body, message: " " },
    })).status, 400);
  });

  await t.test("linked projects and experiences cannot be deleted", async (subtest) => {
    if (!applicationId || !projectId || !experienceId) {
      subtest.skip("requires the application and candidate items to be created first");
      return;
    }
    await pool.query(
      `INSERT INTO application_projects (application_id, project_id, person_id)
       VALUES ($1, $2, $3)`,
      [applicationId, projectId, userId],
    );
    await pool.query(
      `INSERT INTO application_experiences (application_id, experience_id, person_id)
       VALUES ($1, $2, $3)`,
      [applicationId, experienceId, userId],
    );

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
