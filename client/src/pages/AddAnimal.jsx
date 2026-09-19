import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnimal } from "../services/animalService.js";
import { uploadImage } from "../services/cloudinaryService.js";
import "../styles/addAnimal.css";

function AddAnimal() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    health_status: "",
    health_issues: "",
    
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

   try {
  let imageUrl = null;

  if (image) {
    imageUrl = await uploadImage(image);
  }

  await createAnimal({
    ...formData,
    image_url: imageUrl,
    age: Number(formData.age),
    latitude: formData.latitude
      ? Number(formData.latitude)
      : null,
    longitude: formData.longitude
      ? Number(formData.longitude)
      : null,
    status: "available",
  });

  navigate("/adoption");
} catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-animal-page">

      <div className="add-animal-container">

        <div className="add-animal-header">
          <p className="add-animal-tagline">🐾 GIVE THEM A HOME</p>

          <h1>Put an Animal Up for Adoption</h1>

          <p>
            Tell us about the animal and help them find a loving
            forever home.
          </p>
        </div>


        <form
          className="add-animal-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC INFORMATION */}
          <div className="form-section">

            <h2>Basic Information</h2>

            <div className="form-row">

              <div className="form-group">
                <label>Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Luna"
                  required
                />
              </div>


              <div className="form-group">
                <label>Species *</label>

                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
              </div>

            </div>


            <div className="form-row">

              <div className="form-group">
                <label>Breed</label>

                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g. Labrador"
                />
              </div>


              <div className="form-group">
                <label>Age (years)</label>

                <input
                  type="number"
                  name="age"
                  min="0"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                />
              </div>

            </div>


            <div className="form-group">
              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

          </div>


          {/* LOCATION */}
          <div className="form-section">

            <h2>Location</h2>

            <div className="form-group">
              <label>Location *</label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Chennai"
                required
              />
            </div>


            <div className="form-row">

              <div className="form-group">
                <label>Latitude</label>

                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>


              <div className="form-group">
                <label>Longitude</label>

                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

            </div>

          </div>


          {/* DESCRIPTION */}
          <div className="form-section">

            <h2>About the Animal</h2>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell potential adopters about this animal..."
                rows="5"
              />
            </div>

          </div>


          {/* HEALTH */}
          <div className="form-section">

            <h2>Health Information</h2>

            <div className="form-group">
              <label>Health Status</label>

              <select
                name="health_status"
                value={formData.health_status}
                onChange={handleChange}
              >
                <option value="">Select health status</option>
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Recovering">Recovering</option>
                <option value="Special Care Needed">
                  Special Care Needed
                </option>
              </select>
            </div>


            <div className="form-group">
              <label>Health Issues</label>

              <textarea
                name="health_issues"
                value={formData.health_issues}
                onChange={handleChange}
                placeholder="Mention any known health issues..."
                rows="4"
              />
            </div>

          </div>


          
          {/* IMAGE */}
<div className="form-section">

  <h2>Animal Photo</h2>

  <div className="form-group">
    <label>Choose a photo</label>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];

        if (file) {
          setImage(file);
          setImagePreview(URL.createObjectURL(file));
        }
      }}
    />
  </div>

  {imagePreview && (
    <div className="image-preview">
      <img
        src={imagePreview}
        alt="Animal preview"
      />
    </div>
  )}

</div>


          {error && (
            <p className="add-animal-error">
              {error}
            </p>
          )}


          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/adoption")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-animal-button"
              disabled={loading}
            >
              {loading
                ? "Putting up for adoption..."
                : "Put Up for Adoption"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddAnimal;