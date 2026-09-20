import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import "../styles/account.css";

function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ================= LOAD ACCOUNT =================

  const loadAccount = async () => {
    try {
      setLoading(true);

      // --------------------------------
      // 1. Get logged-in Supabase user
      // --------------------------------

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      console.log("AUTH USER:", authUser);
      console.log("AUTH ERROR:", authError);

      if (authError) {
        console.error("Authentication error:", authError);
        setUser(null);
        return;
      }

      if (!authUser) {
        console.log("No authenticated user found.");
        setUser(null);
        return;
      }

      // --------------------------------
      // 2. Get profile from users table
      // --------------------------------

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("name, email, phone, location")
        .eq("user_id", authUser.id)
        .single();

      console.log("AUTH USER ID:", authUser.id);
      console.log("PROFILE:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        console.error(
          "Could not fetch profile from users table:",
          profileError
        );

        setUser(null);
        return;
      }

      // --------------------------------
      // 3. Store database profile
      // --------------------------------

      setUser({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
      });

    } catch (error) {
      console.error("Unexpected account error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  // ================= LOADING =================

  if (loading) {
    return (
      <div className="account-page">
        <p>Loading account...</p>
      </div>
    );
  }


  // ================= NOT LOGGED IN =================

  if (!user) {
    return (
      <div className="account-page">
        <p>Please log in to view your account.</p>
      </div>
    );
  }


  // ================= ACCOUNT PAGE =================

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


          {/* Listings will be connected to animals table next */}

          <div className="profile-listings">

            <p>
              Your adoption listings will appear here.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Account;