import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { uploadImage } from "../services/cloudinaryService";
import "../styles/rescue.css";

const BASE_URL = "/api/abuse-reports";

const contacts = [
  {
    title: "Tamil Nadu Animal Welfare Board",
    description:
      "For animal cruelty complaints and animal-welfare assistance in Tamil Nadu. The help desk details below should be checked before relying on them for urgent assistance.",
    phone: "044-24575701",
    phoneLabel: "044 2457 5701",
    email: "tnawb23@gmail.com",
    address:
      "No. 13/1, 3rd Seaward Road, Valmiki Nagar, Thiruvanmiyur, Chennai – 600 041",
    website: "https://tnawb.tn.gov.in/complaint",
    hours: "Listed help-desk hours: Monday–Friday, 10 AM–5:45 PM",
  },
  {
    title: "Animal Welfare Board of India",
    description:
      "A national animal-welfare body. Contact it for guidance on animal-welfare concerns and appropriate complaint channels. Confirm the helpline is operational before relying on it.",
    phone: "1800-425-1156",
    phoneLabel: "1800-425-1156",
  },
  {
    title: "Animal Mobile Medical Ambulance",
    description:
      "Veterinary assistance for animals in need. This is intended for medical assistance, not a substitute for reporting suspected cruelty to the relevant authority.",
    phone: "1962",
    phoneLabel: "1962",
  },
];

function AddAbuseReport() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    description: "",
    location: "",
  });

  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      setError("Description and location are required.");
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please log in to submit an abuse report.");
      }

      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const reportData = {
        description: formData.description.trim(),
        location: formData.location.trim(),
        image_url: imageUrl,
      };

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to submit the abuse report."
        );
      }

      setSuccess(
        "Your abuse report has been submitted successfully."
      );

      setFormData({
        description: "",
        location: "",
      });

      setImage(null);
      formRef.current?.reset();
    } catch (err) {
      console.error("Error submitting abuse report:", err);
      setError(err.message || "Failed to submit the abuse report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rescue-page">
      <section className="rescue-hero">
        <h1>Report Animal Abuse</h1>
        <p>
          Help protect animals by documenting suspected cruelty,
          neglect, or mistreatment. Provide the location and a
          clear description so the incident can be reviewed.
        </p>
      </section>

      <section className="rescue-form-section">
        <h2>Submit an Abuse Report</h2>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>
            
            <button
              type="button"
              className="add-report-btn"
              onClick={() => navigate("/report")}
            >
              View All Reports
            </button>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">
              Incident Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you observed, when it happened, and any relevant details..."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Incident Location / Address
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter the location of the incident"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">
              Upload Photo Evidence (optional)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Abuse Report"}
          </button>

          <button
            type="button"
            className="back-to-reports-btn"
            onClick={() => navigate("/report")}
            disabled={submitting}
          >
            Back to Abuse Reports
          </button>
        </form>
      </section>

      {success && (
        <section className="my-reports-section">
          <h2>Animal Welfare Contacts</h2>
          <p>
            Use these contacts to seek assistance or report suspected
            cruelty. Confirm current contact details and availability,
            particularly if the situation is urgent.
          </p>

          <div className="rescue-reports-list">
            {contacts.map((contact) => (
              <article
                className="rescue-report-card"
                key={contact.title}
              >
                <div className="report-header">
                  <h3>{contact.title}</h3>
                </div>

                <p>{contact.description}</p>

                {contact.hours && (
                  <p>
                    <strong>Hours:</strong> {contact.hours}
                  </p>
                )}

                {contact.address && (
                  <p>
                    <strong>Address:</strong> {contact.address}
                  </p>
                )}

                <div className="contact-actions">
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`}>
                      Call {contact.phoneLabel}
                    </a>
                  )}

                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}?subject=${encodeURIComponent(
                        "Animal Welfare Complaint"
                      )}&body=${encodeURIComponent(
                        "Hello,\n\nI would like to report an animal-welfare concern.\n\nIncident location:\n\nIncident details:\n\nDate and time observed:\n\nPlease advise on the next steps.\n"
                      )}`}
                    >
                      Email {contact.email}
                    </a>
                  )}

                  {contact.website && (
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Official Complaint Portal
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p>
            Email links open your email application with a suggested
            subject and message. Add the incident details and attach
            any photographs yourself before sending.
          </p>
        </section>
      )}
    </div>
  );
}

export default AddAbuseReport;
