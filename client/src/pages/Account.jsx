import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyRescueReports,
  deleteRescueReport,
} from "../services/rescueService";
import { supabase } from "../services/supabaseClient";
import "../styles/account.css";

function Account() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);

  // Adoption requests made by this user
  const [requestedAnimals, setRequestedAnimals] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Adoption requests received for animals I listed
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [receivedRequestsLoading, setReceivedRequestsLoading] =
    useState(true);

  // Rescue reports submitted by this user
  const [rescueReports, setRescueReports] = useState([]);
  const [rescueReportsLoading, setRescueReportsLoading] = useState(true);

  // Track which requester details are expanded
  const [expandedRequests, setExpandedRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    loadAccount();

    // Listen for login/logout/session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);

      if (session?.user) {
        loadAccount();
      } else {
        setUser(null);
        setListings([]);
        setRequestedAnimals([]);
        setReceivedRequests([]);
        setRescueReports([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // LOAD ACCOUNT
  // =====================================================

  const loadAccount = async () => {
    try {
      setLoading(true);

      // Get logged-in user
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      console.log("AUTH USER:", authUser);
      console.log("AUTH ERROR:", authError);

      if (authError || !authUser) {
        setUser(null);
        setListings([]);
        setRequestedAnimals([]);
        setReceivedRequests([]);
        setRescueReports([]);
        return;
      }

      // =================================================
      // GET USER PROFILE
      // =================================================

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("name, email, phone, location")
        .eq("user_id", authUser.id)
        .single();

      console.log("PROFILE:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        console.error("Profile error:", profileError);
        setUser(null);
        return;
      }

      setUser({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
      });

      // =================================================
      // GET USER'S ADOPTION LISTINGS
      // =================================================

      setListingsLoading(true);

      const { data: userListings, error: listingsError } = await supabase
        .from("animals")
        .select(
          "animal_id, name, species, breed, age, gender, location, status"
        )
        .eq("posted_by", authUser.id)
        .order("created_at", { ascending: false });

      console.log("USER LISTINGS:", userListings);
      console.log("LISTINGS ERROR:", listingsError);

      if (listingsError) {
        console.error("Listings error:", listingsError);
        setListings([]);
      } else {
        setListings(userListings || []);
      }

      // =================================================
      // GET USER'S ADOPTION REQUESTS
      // =================================================

      setRequestsLoading(true);

      const { data: userRequests, error: requestsError } = await supabase
        .from("adoption_requests")
        .select(
          `
          request_id,
          animal_id,
          status,
          created_at,
          animals (
            animal_id,
            name,
            species,
            breed,
            age,
            gender,
            location,
            status
          )
        `
        )
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      console.log("USER ADOPTION REQUESTS:", userRequests);
      console.log("REQUESTS ERROR:", requestsError);

      if (requestsError) {
        console.error("Adoption requests error:", requestsError);
        setRequestedAnimals([]);
      } else {
        setRequestedAnimals(userRequests || []);
      }

      // =================================================
      // GET USER'S RESCUE REPORTS
      // =================================================

      setRescueReportsLoading(true);

      try {
        const rescueData = await getMyRescueReports();
        setRescueReports(rescueData?.reports || []);
      } catch (rescueError) {
        console.error("Rescue reports error:", rescueError);
        setRescueReports([]);
      } finally {
        setRescueReportsLoading(false);
      }

      // =================================================
      // GET ADOPTION REQUESTS FOR MY LISTINGS
      // =================================================

      setReceivedRequestsLoading(true);

      const myAnimalIds = (userListings || []).map(
        (animal) => animal.animal_id
      );

      if (myAnimalIds.length === 0) {
        setReceivedRequests([]);
      } else {
        const {
          data: incomingRequests,
          error: incomingRequestsError,
        } = await supabase
          .from("adoption_requests")
          .select(
            `
            request_id,
            animal_id,
            user_id,
            status,
            created_at
          `
          )
          .in("animal_id", myAnimalIds)
          .order("created_at", { ascending: false });

        console.log(
          "RECEIVED ADOPTION REQUESTS:",
          incomingRequests
        );
        console.log(
          "RECEIVED REQUESTS ERROR:",
          incomingRequestsError
        );

        if (incomingRequestsError) {
          console.error(
            "Received adoption requests error:",
            incomingRequestsError
          );
          setReceivedRequests([]);
        } else {
          // Get only name, phone and email of requesters
          // through the secure RPC function.
          const {
            data: requesterProfiles,
            error: requesterError,
          } = await supabase.rpc("get_my_adoption_requesters");

          console.log(
            "REQUESTER PROFILES:",
            requesterProfiles
          );
          console.log(
            "REQUESTER PROFILES ERROR:",
            requesterError
          );

          if (requesterError) {
            console.error(
              "Requester profiles error:",
              requesterError
            );
          }

          const requestsWithUsers = (incomingRequests || []).map(
            (request) => ({
              ...request,
              requester:
                (requesterProfiles || []).find(
                  (profile) =>
                    profile.request_id === request.request_id
                ) || null,
            })
          );

          setReceivedRequests(requestsWithUsers);
        }
      }
    } catch (error) {
      console.error("Unexpected account error:", error);
      setUser(null);
      setListings([]);
      setRequestedAnimals([]);
      setReceivedRequests([]);
      setRescueReports([]);
    } finally {
      setLoading(false);
      setListingsLoading(false);
      setRequestsLoading(false);
      setReceivedRequestsLoading(false);
      setRescueReportsLoading(false);
    }
  };

  // =====================================================
  // TOGGLE REQUESTER DETAILS
  // =====================================================

  const toggleRequestDetails = (requestId) => {
    setExpandedRequests((current) =>
      current.includes(requestId)
        ? current.filter((id) => id !== requestId)
        : [...current, requestId]
    );
  };

  // =====================================================
  // MARK ANIMAL AS ADOPTED
  // =====================================================

  const handleMarkAdopted = async (animalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this animal as adopted?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("animals")
      .update({ status: "adopted" })
      .eq("animal_id", animalId);

    if (error) {
      console.error("Error updating animal:", error);
      alert("Could not update the animal status.");
      return;
    }

    // Update UI immediately
    setListings((currentListings) =>
      currentListings.map((animal) =>
        animal.animal_id === animalId
          ? { ...animal, status: "adopted" }
          : animal
      )
    );
  };

  // =====================================================
  // REMOVE LISTING
  // =====================================================

  const handleRemoveListing = async (animalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this adoption listing?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("animals")
      .delete()
      .eq("animal_id", animalId);

    if (error) {
      console.error("Error removing listing:", error);
      alert("Could not remove the listing.");
      return;
    }

    // Remove from UI
    setListings((currentListings) =>
      currentListings.filter(
        (animal) => animal.animal_id !== animalId
      )
    );
  };

  // =====================================================
  // DELETE ADOPTION REQUEST
  // =====================================================

  const handleDeleteRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this adoption request?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("adoption_requests")
      .delete()
      .eq("request_id", requestId);

    if (error) {
      console.error("Error deleting adoption request:", error);
      alert("Could not delete the adoption request.");
      return;
    }

    // Remove from UI
    setRequestedAnimals((currentRequests) =>
      currentRequests.filter(
        (request) => request.request_id !== requestId
      )
    );
  };

  // =====================================================
  // DELETE RESCUE REPORT
  // =====================================================

  const handleDeleteRescueReport = async (reportId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rescue report?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await deleteRescueReport(reportId);

    if (error) {
      console.error("Error deleting rescue report:", error);
      alert("Could not delete the rescue report.");
      return;
    }

    setRescueReports((currentReports) =>
      currentReports.filter((report) => report.report_id !== reportId)
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="account-page">
        <p>Loading account...</p>
      </div>
    );
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {
    return (
      <div className="account-page">
        <p>Please log in to view your account.</p>
      </div>
    );
  }

  // =====================================================
  // ACCOUNT PAGE
  // =====================================================

  return (
    <div className="account-page">

      {/* ================= PROFILE HEADER ================= */}

      <section className="profile-header">

        <h1>{user.name}</h1>

        <p className="profile-email">
          {user.email}
        </p>

        {user.location && (
          <p className="profile-location">
            📍 {user.location}
          </p>
        )}

      </section>

      {/* ================= PROFILE CONTENT ================= */}

      <main className="account-content">

        {/* ================= ABOUT ================= */}

        <section className="profile-section">

          <h2>About Me</h2>

          <p className="profile-bio">
            Animal lover helping stray animals find safe and loving homes.
          </p>

        </section>

        {/* ================= MY LISTINGS ================= */}

        <section className="profile-section">

          <div className="section-title-row">

            <div>

              <h2>My Adoption Listings</h2>

              <p>
                Animals you have listed for adoption.
              </p>

            </div>

            <Link
              to="/adoption/add"
              className="add-listing-btn"
            >
              + Add Animal
            </Link>

          </div>

          {/* ================= LISTINGS ================= */}

          <div className="profile-listings">

            {listingsLoading ? (

              <p>Loading your adoption listings...</p>

            ) : listings.length === 0 ? (

              <p>
                You haven't listed any animals for adoption yet.
              </p>

            ) : (

              listings.map((animal) => {

                const animalRequests = receivedRequests.filter(
                  (request) =>
                    request.animal_id === animal.animal_id
                );

                return (

                  <div
                    className="profile-listing"
                    key={animal.animal_id}
                  >

                    <div className="listing-animal">

                      <div className="listing-emoji">

                        {animal.species?.toLowerCase() === "cat"
                          ? "🐈"
                          : "🐕"}

                      </div>

                      <div>

                        <div className="listing-name-row">

                          <h3>
                            {animal.name}
                          </h3>

                          <span
                            className={`status-badge ${animal.status}`}
                          >

                            {animal.status === "available" &&
                              "● Available"}

                            {animal.status === "adopted" &&
                              "✓ Adopted"}

                            {animal.status !== "available" &&
                              animal.status !== "adopted" &&
                              animal.status}

                          </span>

                        </div>

                        <p>
                          {animal.species}
                          {" · "}
                          {animal.breed}
                          {" · "}
                          {animal.age} years
                        </p>

                        {animal.location && (
                          <span className="listing-location">
                            📍 {animal.location}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ================= ADOPTION REQUESTS ================= */}

                    {animal.status === "available" && (
                      <div className="received-requests">

                        <h4>Adoption Requests</h4>

                        {receivedRequestsLoading ? (

                          <p>Loading requests...</p>

                        ) : animalRequests.length === 0 ? (

                          <p>No adoption requests yet.</p>

                        ) : (

                          animalRequests.map((request) => {

                            const isExpanded =
                              expandedRequests.includes(
                                request.request_id
                              );

                            return (

                              <div
                                className="received-request"
                                key={request.request_id}
                              >

                                <div>

                                  <div className="listing-name-row">

                                    <strong>
                                      {request.requester?.name ||
                                        "Unknown User"}
                                    </strong>

                                  </div>

                                  {/* VIEW DETAILS */}

                                  <button
                                    className="view-details-btn"
                                    onClick={() =>
                                      toggleRequestDetails(
                                        request.request_id
                                      )
                                    }
                                  >
                                    {isExpanded
                                      ? "Hide Details"
                                      : "View Details"}
                                  </button>

                                  {isExpanded && (
                                    <div className="requester-details">

                                      <p>
                                        <strong>Name:</strong>{" "}
                                        {request.requester?.name ||
                                          "Not available"}
                                      </p>

                                      <p>
                                        <strong>Contact:</strong>{" "}
                                        {request.requester?.phone ||
                                          "Not available"}
                                      </p>

                                      <p>
                                        <strong>Email:</strong>{" "}
                                        {request.requester?.email ||
                                          "Not available"}
                                      </p>

                                    </div>
                                  )}

                                </div>

                              </div>

                            );

                          })

                        )}

                      </div>
                    )}

                    {/* ================= ACTIONS ================= */}

                    {animal.status === "available" && (

                      <div className="listing-actions">

                        <button
                          className="adopted-btn"
                          onClick={() =>
                            handleMarkAdopted(animal.animal_id)
                          }
                        >
                          Mark as Adopted
                        </button>

                        <button
                          className="remove-btn"
                          onClick={() =>
                            handleRemoveListing(animal.animal_id)
                          }
                        >
                          Remove Listing
                        </button>

                      </div>

                    )}

                  </div>

                );

              })

            )}

          </div>

        </section>

        {/* ================= MY ADOPTION REQUESTS ================= */}

        <section className="profile-section">

          <div className="section-title-row">

            <div>

              <h2>Animals I've Requested to Adopt</h2>

              <p>
                Animals you have requested for adoption.
              </p>

            </div>

          </div>

          <div className="profile-listings">

            {requestsLoading ? (

              <p>Loading your adoption requests...</p>

            ) : requestedAnimals.length === 0 ? (

              <p>
                You haven't requested to adopt any animals yet.
              </p>

            ) : (

              requestedAnimals.map((request) => {

                const animal = request.animals;

                return (

                  <div
                    className="profile-listing"
                    key={request.request_id}
                  >

                    <div className="listing-animal">

                      <div className="listing-emoji">

                        {animal?.species?.toLowerCase() === "cat"
                          ? "🐈"
                          : "🐕"}

                      </div>

                      <div>

                        <div className="listing-name-row">

                          <h3>
                            {animal?.name}
                          </h3>

                        </div>

                        <p>
                          {animal?.species}
                          {" · "}
                          {animal?.breed}
                          {" · "}
                          {animal?.age} years
                        </p>

                        {animal?.location && (
                          <span className="listing-location">
                            📍 {animal.location}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ================= DELETE REQUEST ================= */}

                    <div className="listing-actions">

                      <button
                        className="remove-btn"
                        onClick={() =>
                          handleDeleteRequest(request.request_id)
                        }
                      >
                        Delete Request
                      </button>

                    </div>

                  </div>

                );

              })

            )}

          </div>

        </section>

        {/* ================= MY RESCUE REPORTS ================= */}

        <section className="profile-section">

          <div className="section-title-row">

            <div>

              <h2>My Rescue Reports</h2>

              <p>
                Rescue reports you have submitted.
              </p>

            </div>

          </div>

          <div className="profile-listings">

            {rescueReportsLoading ? (

              <p>Loading your rescue reports...</p>

            ) : rescueReports.length === 0 ? (

              <p>
                You haven't submitted any rescue reports yet.
              </p>

            ) : (

              <div className="rescue-reports-list">

                {rescueReports.map((report) => (

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
                        handleDeleteRescueReport(report.report_id)
                      }
                    >
                      Delete Report
                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Account;