
import { useState } from "react";
import { createAdoptionRequest } from "../services/adoptionService.js";

function AnimalCard({ animal }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInterested = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await createAdoptionRequest(animal.animal_id);

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animal-card">

      {animal.image_url && (
        <img src={animal.image_url} alt={animal.name} />
      )}

      <h3>{animal.name}</h3>

      <p>{animal.species}</p>

      <span className={`status status-${animal.status}`}>
        {animal.status}
      </span>

      <button
        type="button"
        onClick={handleInterested}
        disabled={loading || animal.status !== "available"}
      >
        {loading ? "Submitting..." : "Interested"}
      </button>

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

    </div>
  );
}

export default AnimalCard;

