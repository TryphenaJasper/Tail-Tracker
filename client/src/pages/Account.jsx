import { Link } from "react-router-dom";
import "../styles/account.css";

function Account() {
  // Dummy data for now
  const user = {
    name: "Tryphena Jasper",
    email: "tryphenajaspersamuel@gmail.com",
    location: "Chennai, Tamil Nadu",
    bio: "Animal lover helping stray animals find safe and loving homes.",
  };

  const listings = [
    {
      id: 1,
      emoji: "🐕",
      name: "Luna",
      species: "Dog",
      breed: "Indie",
      age: "2 years",
      location: "Chennai",
      status: "available",
    },
    {
      id: 2,
      emoji: "🐈",
      name: "Milo",
      species: "Cat",
      breed: "Domestic Shorthair",
      age: "1 year",
      location: "Chennai",
      status: "adopted",
    },
  ];

  return (
    <div className="account-page">

      {/* ================= PROFILE HEADER ================= */}

      <section className="profile-header">

        

        <h1>{user.name}</h1>

        <p className="profile-email">
          {user.email}
        </p>

        <p className="profile-location">
          📍 {user.location}
        </p>

      </section>


      {/* ================= PROFILE CONTENT ================= */}

      <main className="account-content">

        {/* About */}

        <section className="profile-section">

          <h2>About Me</h2>

          <p className="profile-bio">
            {user.bio}
          </p>

        </section>


        {/* My Listings */}

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


          {/* Listings */}

          <div className="profile-listings">

            {listings.map((animal) => (

              <div
                className="profile-listing"
                key={animal.id}
              >

                <div className="listing-animal">

                  <div className="listing-emoji">
                    {animal.emoji}
                  </div>

                  <div>

                    <div className="listing-name-row">

                      <h3>{animal.name}</h3>

                      <span
                        className={`status-badge ${animal.status}`}
                      >
                        {animal.status === "available"
                          ? "● Available"
                          : "✓ Adopted"}
                      </span>

                    </div>

                    <p>
                      {animal.species} · {animal.breed} ·{" "}
                      {animal.age}
                    </p>

                    <span className="listing-location">
                      📍 {animal.location}
                    </span>

                  </div>

                </div>


                {/* Actions only for available animals */}

                {animal.status === "available" && (

                  <div className="listing-actions">

                    <button className="adopted-btn">
                      Mark as Adopted
                    </button>

                    <button className="remove-btn">
                      Remove Listing
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Account;