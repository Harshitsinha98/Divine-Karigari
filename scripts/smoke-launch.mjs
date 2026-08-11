const baseUrl = (process.env.QA_BASE_URL ?? "http://127.0.0.1:3100").replace(
  /\/$/,
  "",
);

let failures = 0;
const secureHeaders = { "x-forwarded-proto": "https" };

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail) {
  failures += 1;
  console.error(`FAIL ${label}: ${detail}`);
}

async function check(label, test) {
  try {
    const detail = await test();
    if (detail === true || detail === undefined) pass(label);
    else fail(label, detail);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

await check("public page and security headers", async () => {
  const response = await fetch(`${baseUrl}/about`, { headers: secureHeaders });
  if (response.status !== 200)
    return `expected 200, received ${response.status}`;
  const required = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
  ];
  const missing = required.filter((header) => !response.headers.get(header));
  return missing.length ? `missing ${missing.join(", ")}` : true;
});

await check("admin route requires admin session", async () => {
  const response = await fetch(`${baseUrl}/admin`, {
    headers: secureHeaders,
    redirect: "manual",
  });
  return response.status === 307 &&
    response.headers.get("location")?.includes("/admin/login")
    ? true
    : `received ${response.status} ${response.headers.get("location")}`;
});

await check("account route requires customer session", async () => {
  const response = await fetch(`${baseUrl}/account`, {
    headers: secureHeaders,
    redirect: "manual",
  });
  return response.status === 307 &&
    response.headers.get("location")?.includes("/login")
    ? true
    : `received ${response.status} ${response.headers.get("location")}`;
});

await check("robots excludes private routes", async () => {
  const response = await fetch(`${baseUrl}/robots.txt`, {
    headers: secureHeaders,
  });
  const body = await response.text();
  const exclusions = ["/admin", "/account", "/checkout", "/cart", "/wishlist"];
  const missing = exclusions.filter((path) => !body.includes(path));
  return response.status === 200 && !missing.length
    ? true
    : `status ${response.status}; missing ${missing.join(", ")}`;
});

await check("cross-site form request is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...secureHeaders,
    },
    body: JSON.stringify({
      name: "QA User",
      email: "qa@example.com",
      subject: "Launch check",
      message: "Testing cross-site request protection.",
    }),
  });
  return response.status === 403
    ? true
    : `expected 403, received ${response.status}`;
});

await check("same-origin contact form succeeds", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
      ...secureHeaders,
    },
    body: JSON.stringify({
      name: "QA User",
      email: "qa@example.com",
      subject: "Launch check",
      message: "Testing same-origin form submission.",
    }),
  });
  return response.status === 201
    ? true
    : `expected 201, received ${response.status}`;
});

await check("invalid Shiprocket webhook token is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/shiprocket/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-shiprocket-token": "invalid",
      ...secureHeaders,
    },
    body: "{}",
  });
  return response.status === 401
    ? true
    : `expected 401, received ${response.status}`;
});

await check("unauthorized cron request is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/cron/abandoned-cart`, {
    headers: secureHeaders,
  });
  return response.status === 401
    ? true
    : `expected 401, received ${response.status}`;
});

await check("HTTP forwarding is redirected to HTTPS", async () => {
  const response = await fetch(`${baseUrl}/about`, {
    headers: { "x-forwarded-proto": "http" },
    redirect: "manual",
  });
  return response.status === 308 &&
    response.headers.get("location")?.startsWith("https://")
    ? true
    : `received ${response.status} ${response.headers.get("location")}`;
});

await check("auth endpoint is rate limited", async () => {
  const statuses = [];
  for (let attempt = 0; attempt < 13; attempt += 1) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
        ...secureHeaders,
      },
      body: "{}",
    });
    statuses.push(response.status);
  }
  return statuses.includes(429)
    ? true
    : `expected a 429 response, received ${statuses.join(", ")}`;
});

if (failures) {
  console.error(`${failures} launch smoke check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("All launch smoke checks passed.");
}
