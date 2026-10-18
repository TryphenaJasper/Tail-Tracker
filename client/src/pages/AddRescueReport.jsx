
import { useRef,useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRescueReport } from "../services/rescueService";
import { uploadImage } from "../services/cloudinaryService";
import "../styles/rescue.css";

function AddRescueReport() {
  const navigate = useNavigate();
    const formRef = useRef(null);
  const [formData, setFormData] = useState({
    animal_type: "dog",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    severity: "medium",
  });

  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.description.trim() || !formData.location.trim()) {
      setError("Description and location are required.");
      return;
    }

    try {
      setSubmitting(true);

      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const reportData = {
        animal_type: formData.animal_type,
        description: formData.description.trim(),
        location: formData.location.trim(),
        latitude: formData.latitude
          ? Number(formData.latitude)
          : null,
        longitude: formData.longitude
          ? Number(formData.longitude)
          : null,
        image_url: imageUrl,
        severity: formData.severity,
      };

      await createRescueReport(reportData);

      setSuccess("Rescue report submitted successfully!");

      setFormData({
        animal_type: "dog",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        severity: "medium",
      });

      setImage(null);
      formRef.current?.reset();
    } catch (error) {
      console.error("Error creating rescue report:", error);
      setError(error.message || "Failed to submit rescue report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rescue-page">
      <section className="rescue-hero">
        <h1>Report an Animal in Need</h1>

        <p>
          Found an injured, abandoned, or distressed animal?
          Submit a rescue report and help get them the care they need.
        </p>
      </section>

      <section className="rescue-form-section">
        <h2>Submit a Rescue Report</h2>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>

            <button
              type="button"
              className="add-report-btn"
              onClick={() => navigate("/rescue")}
            >
              View All Reports
            </button>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="animal_type">Animal Type</label>

            <select
              id="animal_type"
              name="animal_type"
              value={formData.animal_type}
              onChange={handleChange}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the animal and what happened..."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location / Address</label>

            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter the animal's location"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Optional for now"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Optional for now"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image</label>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity</label>

            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Rescue Report"}
          </button>

          <button
            type="button"
            className="back-to-reports-btn"
            onClick={() => navigate("/rescue")}
            disabled={submitting}
          >
            Back to Reports
          </button>
        </form>
      </section>
    </div>
  );
}

export default AddRescueReport;
