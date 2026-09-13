import { useEffect, useState } from "react";
import { getAnimals } from "../services/animalService.js";
import AnimalCard from "./AnimalCard.jsx";
function AnimalList() {
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

  return (
    <div className="animal-list">
      {animals.map((animal) => (
        <AnimalCard key={animal._id} animal={animal} />
      ))}
    </div>
  );
}

export default AnimalList;
