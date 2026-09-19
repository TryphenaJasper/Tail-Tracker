import { useEffect, useState } from "react";
import { getAnimals } from "../services/animalService.js";
import AnimalCard from "./AnimalCard.jsx";

function AnimalList({
  search,
  species,
  age,
  gender,
  location,
}) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnimals()
      .then(setAnimals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading animals...</p>;

  if (error) return <p>Error: {error}</p>;

  // Only show animals currently available for adoption
  let filteredAnimals = animals.filter(
    (animal) => animal.status === "available"
  );

  // Search by name, breed, or location
  if (search.trim() !== "") {
    const searchText = search.toLowerCase();

    filteredAnimals = filteredAnimals.filter((animal) =>
      animal.name?.toLowerCase().includes(searchText) ||
      animal.breed?.toLowerCase().includes(searchText) ||
      animal.location?.toLowerCase().includes(searchText)
    );
  }

  // Filter by species
  if (species !== "") {
    filteredAnimals = filteredAnimals.filter(
      (animal) => animal.species?.toLowerCase() === species.toLowerCase()
    );
  }

  // Filter by gender
  if (gender !== "") {
    filteredAnimals = filteredAnimals.filter(
      (animal) => animal.gender?.toLowerCase() === gender.toLowerCase()
    );
  }

  // Filter by location
  if (location !== "") {
    filteredAnimals = filteredAnimals.filter(
      (animal) =>
        animal.location?.toLowerCase() === location.toLowerCase()
    );
  }

  // Filter by age category
  if (age !== "") {
    filteredAnimals = filteredAnimals.filter((animal) => {
      const animalAge = Number(animal.age);

      if (Number.isNaN(animalAge)) {
        return false;
      }

      if (age === "young") {
        return animalAge <= 2;
      }

      if (age === "adult") {
        return animalAge > 2 && animalAge <= 7;
      }

      if (age === "senior") {
        return animalAge > 7;
      }

      return true;
    });
  }

  return (
    <div className="animal-list">

      {filteredAnimals.length === 0 ? (
        <p>No animals found matching your filters.</p>
      ) : (
        filteredAnimals.map((animal) => (
          <AnimalCard
            key={animal.animal_id}
            animal={animal}
          />
        ))
      )}

    </div>
  );
}

export default AnimalList;