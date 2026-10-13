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
