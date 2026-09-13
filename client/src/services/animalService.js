// Keeps all your API calls in one place instead of scattering fetch()
// calls across components. Same pattern you used for OpenWeatherMap,
// just pointed at your own backend instead of a third-party API.

const BASE_URL = "/api/animals";

export const getAnimals = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch animals");
  return res.json();
};

export const getAnimalById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch animal");
  return res.json();
};

export const createAnimal = async (animalData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(animalData),
  });
  if (!res.ok) throw new Error("Failed to create animal");
  return res.json();
};

// TODO (you): add updateAnimal, deleteAnimal following the same pattern
