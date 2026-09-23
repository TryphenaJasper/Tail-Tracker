
import { useEffect, useState } from "react";
import {
  createRescueReport,
  getRescueReports,
  deleteRescueReport,
} from "../services/rescueService";
import { uploadImage } from "../services/cloudinaryService";
import "../styles/rescue.css";

function Rescue() {
  const [formData, setFormData] = useState({
    animal_type: "dog",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    severity: "medium",
  });

  const [image, setImage] = useState(null);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD ALL RESCUE REPORTS
  // =====================================================

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRescueReports();

      setReports(data || []);
    } catch (error) {
      console.error("Error loading rescue reports:", error);
      setError(error.message || "Failed to load rescue reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // =====================================================
  // HANDLE FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    setImage(e.target.files[0] || null);
  };

  // =====================================================
  // SUBMIT RESCUE REPORT
  // =====================================================

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

      // Upload image to Cloudinary
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const reportData = {
        animal_type: formData.animal_type,
        description: formData.description,
        location: formData.location,
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

      setSuccess("Rescue report submitted successfully.");

      setFormData({
        animal_type: "dog",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        severity: "medium",
      });

      setImage(null);

      // Reset file input
      e.target.reset();

      await loadReports();
    } catch (error) {
      console.error("Error creating rescue report:", error);
      setError(error.message || "Failed to submit rescue report");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE REPORT
  // =====================================================

  const handleDelete = async (reportId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rescue report?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteRescueReport(reportId);

      setReports((currentReports) =>
        currentReports.filter(
          (report) => report.report_id !== reportId
        )
      );
    } catch (error) {
      console.error("Error deleting rescue report:", error);
      setError(error.message || "Failed to delete rescue report");
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="rescue-page">

      {/* ================= HERO ================= */}

      <section className="rescue-hero">

        <h1>Report an Animal in Need</h1>

        <p>
          Found an injured, abandoned, or distressed animal?
          Submit a rescue report and help get them the care they need.
        </p>

      </section>

      {/* ================= REPORT FORM ================= */}

      <section className="rescue-form-section">

        <h2>Submit a Rescue Report</h2>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          {/* ANIMAL TYPE */}

          <div className="form-group">

            <label htmlFor="animal_type">
              Animal Type
            </label>

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

          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

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

          {/* LOCATION */}

          <div className="form-group">

            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where is the animal located?"
              required
            />

          </div>

          {/* LATITUDE / LONGITUDE */}

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="latitude">
                Latitude
              </label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Optional"
              />

            </div>

            <div className="form-group">

              <label htmlFor="longitude">
                Longitude
              </label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Optional"
              />

            </div>

          </div>

          {/* IMAGE UPLOAD */}

          <div className="form-group">

            <label htmlFor="image">
              Upload Image
            </label>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

          </div>

          {/* SEVERITY */}

          <div className="form-group">

            <label htmlFor="severity">
              Severity
            </label>

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

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Rescue Report"}
          </button>

        </form>

      </section>

      {/* ================= ALL RESCUE REPORTS ================= */}

      <section className="my-reports-section">

        <h2>All Rescue Reports</h2>

        {loading ? (

          <p>Loading rescue reports...</p>

        ) : reports.length === 0 ? (

          <p>
            No rescue reports yet.
          </p>

        ) : (

          <div className="rescue-reports-list">

            {reports.map((report) => (

              <div
                className="rescue-report-card"
                key={report.report_id}
              >

                <div className="report-header">

                  <h3>
                    {report.animal_type
                      ? `${report.animal_type} Rescue Report`
                      : "Rescue Report"}
                  </h3>

                  <span
                    className={`severity-badge ${report.severity}`}
                  >
                    {report.severity}
                  </span>

                </div>

                <p>
                  <strong>Location:</strong>{" "}
                  {report.location}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {report.description}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {report.status}
                </p>

                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt="Reported animal"
                    className="report-image"
                  />
                )}

                <button
                  className="delete-report-btn"
                  onClick={() =>
                    handleDelete(report.report_id)
                  }
                >
                  Delete Report
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Rescue;


