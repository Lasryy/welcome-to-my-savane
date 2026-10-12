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

    return {
      status: response.status,
      cookie: response.headers.get("set-cookie")?.split(";")[0],
      data: response.status === 204 ? null : await response.json(),
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
  let adminId;
  let adminCookie;
  let companyId;
  let categoryId;
  let publishedId;
  let closedId;

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
