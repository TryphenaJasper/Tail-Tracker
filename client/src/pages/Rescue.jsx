
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRescueReports } from "../services/rescueService";
import "../styles/rescue.css";

function Rescue() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getRescueReports();
        setReports(data || []);
      } catch (error) {
        console.error("Error loading rescue reports:", error);
        setError(error.message || "Failed to load rescue reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="rescue-page">
      <section className="rescue-hero">
        <h1>Animal Rescue Reports</h1>

        <p>
          Every report is an opportunity to help an animal in need.
          Browse reported cases and help make a difference.
        </p>
      </section>

      <section className="my-reports-section">
        <h2>All Rescue Reports</h2>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {loading ? (
          <p>Loading rescue reports...</p>
        ) : reports.length === 0 ? (
          <p>No rescue reports yet. Be the first to report an animal in need!</p>
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
                    className={`severity-badge ${
                      report.severity || "medium"
                    }`}
                  >
                    {report.severity || "medium"}
                  </span>
                </div>

                <p>
                  <strong>Location:</strong>{" "}
                  {report.location || "Not provided"}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {report.description}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {report.status || "Pending"}
                </p>

                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt={`Reported ${report.animal_type || "animal"}`}
                    className="report-image"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="add-report-container">
          <p>
            Found an animal that needs help? Your report could make
            a difference.
          </p>

          <button
            type="button"
            className="add-report-btn"
            onClick={() => navigate("/rescue/add")}
          >
            + Add Your Report
          </button>
        </div>
      </section>
    </div>
  );
}

export default Rescue;
