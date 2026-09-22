import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnimalById } from "../services/animalService.js";
import { supabase } from "../services/supabaseClient";
import "../styles/animaldetails.css";

function AnimalDetails() {
  const { animalId } = useParams();

  const [animal, setAnimal] = useState(null);
  const [owner, setOwner] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnimal = async () => {
      try {
        const data = await getAnimalById(animalId);
        setAnimal(data);

        // Get contact information of the person
        // who listed the animal
        if (data?.posted_by) {
          const {
            data: ownerData,
            error: ownerError,
          } = await supabase
            .rpc("get_animal_lister", {
              animal_id_input: data.animal_id,
            })
            .single();

          if (ownerError) {
            console.error(
              "Error fetching owner details:",
              ownerError
            );
          } else {
            setOwner(ownerData);
          }
        }
      } catch (err) {
        console.error("Error fetching animal:", err);
        setError("Could not load animal details.");
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [animalId]);

  if (loading) {
    return (
      <div className="animal-details-page">
        <p>Loading animal details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animal-details-page">
        <p>{error}</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="animal-details-page">
        <p>Animal not found.</p>
      </div>
    );
  }

  return (
    <div className="animal-details-page">

      <div className="animal-details-card">

        {/* ================= HEADER ================= */}

        <div className="animal-details-header">
          <h1>{animal.name}</h1>
        </div>

        {/* ================= CONTENT ================= */}

        <div className="animal-details-content">

          {/* ================= IMAGE ================= */}

          {animal.image_url && (
            <img
              className="animal-details-image"
              src={animal.image_url}
              alt={animal.name}
            />
          )}

          {/* ================= DETAILS ================= */}

          <div className="animal-details-info">

            

            <div className="animal-detail-item">
              <strong>Species</strong>
              <span>
                {animal.species || "Not provided"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Breed</strong>
              <span>
                {animal.breed || "Not provided"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Age</strong>
              <span>
                {animal.age ?? "Not provided"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Gender</strong>
              <span>
                {animal.gender || "Not provided"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Location</strong>
              <span>
                {animal.location || "Not provided"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Health Status</strong>
              <span>
                {animal.health_status || "Not provided"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Health Issues</strong>
              <span>
                {animal.health_issues || "None reported"}
              </span>
            </div>

            <div className="animal-detail-item">
              <strong>Status</strong>
              <span>
                {animal.status || "Not provided"}
              </span>
            </div>

            {/* ================= DESCRIPTION ================= */}

            <div className="animal-detail-description">

              <strong>Description</strong>

              <p>
                {animal.description ||
                  "No description provided."}
              </p>

            </div>

            {/* ================= CONTACT INFORMATION ================= */}

            <div className="animal-detail-contact">

              <h2>Contact the Animal Lister</h2>

              <div className="contact-details">

                <p>
                  <strong>Name:</strong>{" "}
                  {owner?.name || "Not available"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {owner?.phone || "Not available"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {owner?.email || "Not available"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AnimalDetails;