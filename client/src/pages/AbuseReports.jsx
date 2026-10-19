
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rescue.css";

const BASE_URL = "/api/abuse-reports";

function AbuseReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to fetch abuse reports."
          );
        }

        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load abuse reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rescue-page">
      <section className="rescue-hero">
        <h1>Animal Abuse Reports</h1>
        <p>
          Help protect animals by reporting suspected cruelty,
          neglect, or abuse. Review reported incidents and contact
          the appropriate animal-welfare authorities when needed.
        </p>
      </section>

      <section className="my-reports-section">
        <h2>Reported Incidents</h2>

        {loading && <p>Loading abuse reports...</p>}

        {error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && !error && reports.length === 0 && (
          <p>
            No abuse reports have been submitted yet.
            You can be the first to report an incident.
          </p>
        )}

        {!loading && reports.length > 0 && (
          <div className="rescue-reports-list">
            {reports.map((report) => (
              <article
                className="rescue-report-card"
                key={report.report_id}
              >
                <div className="report-header">
                  <h3>
                    Abuse Report
                  </h3>
                </div>

                {report.image_url && (
                  <img
                    className="report-image"
                    src={report.image_url}
                    alt="Evidence attached to an animal abuse report"
                  />
                )}

                <p>
                  <strong>Description:</strong>{" "}
                  {report.description}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {report.location}
                </p>

                <p>
                  <strong>Reported on:</strong>{" "}
                  {formatDate(report.created_at)}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="add-report-container">
          <button
            type="button"
            className="add-report-btn"
            onClick={() => navigate("/report/add")}
          >
            Add Abuse Report
          </button>
        </div>
      </section>
    </div>
  );
}

export default AbuseReports;
