import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/adoption.css";
import AnimalList from "../components/AnimalList.jsx";

function Adoption() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleAddAnimal = async () => {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    navigate("/adoption/add");
  } else {
    navigate("/login");
  }
};

  return (
    <div className="adoption-page">

      {/* ================= HEADER ================= */}
      <section className="adoption-header">

        <div className="adoption-heading">
          <p className="adoption-tagline">🐾 FIND A FRIEND</p>

          <h1>
            Find a loving
            <br />
            <span>companion.</span>
          </h1>

          <p>
            Browse animals waiting for a loving family and give
            them a second chance at a happy home.
          </p>
        </div>

        <button
           onClick={handleAddAnimal}
          className="add-animal-btn"
          >
          + Put an Animal for Adoption
        </button>

      </section>


      {/* ================= SEARCH & FILTERS ================= */}
      <section className="adoption-filters">

        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search by name, breed or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
        >
          <option value="">Species</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
        </select>

        <select
          value={age}
          onChange={(e) => setAge(e.target.value)}
        >
          <option value="">Age</option>
          <option value="young">Young</option>
          <option value="adult">Adult</option>
          <option value="senior">Senior</option>
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Location</option>
          <option value="chennai">Chennai</option>
          <option value="coimbatore">Coimbatore</option>
          <option value="madurai">Madurai</option>
        </select>

      </section>


      {/* ================= ANIMAL LIST ================= */}
      <section className="animals-section">

        <div className="animals-section-heading">
          <h2>Animals looking for a home</h2>

          <p>
            Every adoption is a chance to change a life.
          </p>
        </div>

        <AnimalList
          search={search}
          species={species}
          age={age}
          gender={gender}
          location={location}
        />

      </section>

    </div>
  );
}

export default Adoption;