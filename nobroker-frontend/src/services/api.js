const API_BASE_URL = "https://nobroker-backend-iroo.onrender.com/api";


// ============================================================
// GET PROPERTIES
// ============================================================

export async function getProperties(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      query.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/properties/${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
}


// ============================================================
// GET SINGLE PROPERTY
// ============================================================

export async function getProperty(propertyId) {
  const response = await fetch(
    `${API_BASE_URL}/properties/${propertyId}/`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch property");
  }

  return response.json();
}


// ============================================================
// OWNER DASHBOARD
// ============================================================

// Get properties belonging to the logged-in owner
export async function getMyProperties(token) {
  const response = await fetch(
    `${API_BASE_URL}/properties/mine/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch your properties");
  }

  return response.json();
}


// Get incoming interest requests for the logged-in owner
export async function getOwnerInterests(token) {
  const response = await fetch(
    `${API_BASE_URL}/properties/interests/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch incoming interests");
  }

  return response.json();
}


// ============================================================
// API BASE URL
// ============================================================

export { API_BASE_URL };

export async function updateInterestStatus(
  token,
  interestId,
  status
) {
  const response = await fetch(
    `${API_BASE_URL}/properties/interests/${interestId}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.detail || "Failed to update interest status."
    );
  }

  return response.json();
}
