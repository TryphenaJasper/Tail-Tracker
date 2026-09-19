import { supabase } from "./supabaseClient";
const BASE_URL = "/api/animals";

// Get all animals
export const getAnimals = async () => {
  const res = await fetch(BASE_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch animals");
  }

  return res.json();
};


// Get one animal by ID
export const getAnimalById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch animal");
  }

  return res.json();
};


// Create a new animal
export const createAnimal = async (animalData) => {
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

    body: JSON.stringify(animalData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create animal");
  }

  return data;
};


// Update an animal
export const updateAnimal = async (id, animalData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(animalData),
  });

  if (!res.ok) {
    throw new Error("Failed to update animal");
  }

  return res.json();
};


// Delete an animal
export const deleteAnimal = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete animal");
  }

  return res.json();
};

