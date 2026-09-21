
import { supabase } from "./supabaseClient";

const BASE_URL = "/api/adoptions";

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please login to continue");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
};

// Submit a new adoption request
export const createAdoptionRequest = async (animal_id) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      animal_id,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to submit adoption request");
  }

  return data;
};


// Get logged-in user's adoption requests
export const getMyAdoptionRequests = async () => {
  const res = await fetch(`${BASE_URL}/my`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch adoption requests");
  }

  return data.requests;
};


// Update an adoption request
export const updateAdoptionRequest = async (requestId) => {
  const res = await fetch(`${BASE_URL}/${requestId}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update adoption request");
  }

  return data;
};


// Delete an adoption request
export const deleteAdoptionRequest = async (requestId) => {
  const res = await fetch(`${BASE_URL}/${requestId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to delete adoption request");
  }

  return data;
};

