import { supabase } from "./supabaseClient";

const BASE_URL = "/api/rescue-reports";


// Get all rescue reports
export const getRescueReports = async () => {
  const res = await fetch(BASE_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch rescue reports");
  }

  return res.json();
};


// Get my rescue reports
export const getMyRescueReports = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please login to continue");
  }

  const res = await fetch(`${BASE_URL}/my`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch your rescue reports");
  }

  return data;
};


// Get one rescue report by ID
export const getRescueReportById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch rescue report");
  }

  return res.json();
};


// Create a new rescue report
export const createRescueReport = async (reportData) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please login to continue");
  }

  const res = await fetch(BASE_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },

    body: JSON.stringify(reportData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create rescue report");
  }

  return data;
};


// Update a rescue report
export const updateRescueReport = async (id, reportData) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please login to continue");
  }

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },

    body: JSON.stringify(reportData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update rescue report");
  }

  return data;
};


// Delete a rescue report
export const deleteRescueReport = async (id) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please login to continue");
  }

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to delete rescue report");
  }

  return data;
};