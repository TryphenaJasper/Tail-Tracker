
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { createRescueReport } from "../services/rescueService";
import { uploadImage } from "../services/cloudinaryService";
import "../styles/rescue.css";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (apiKey) {
  setOptions({ key: apiKey, v: "weekly" });
}

function AddRescueReport() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

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
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [submittedLocation, setSubmittedLocation] = useState(null);
  const [nearbyVets, setNearbyVets] = useState([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [vetError, setVetError] = useState("");

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

  // Convert coordinates to a readable address and update the marker.
  const updateLocation = async (lat, lng, address = "") => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const geocoder = geocoderRef.current;

    if (!map || !marker) return;

    map.panTo({ lat, lng });
    marker.setPosition({ lat, lng });
    marker.setVisible(true);

    setFormData((current) => ({
      ...current,
      latitude: String(lat),
      longitude: String(lng),
      ...(address ? { location: address } : {}),
    }));

    if (address) return;

    try {
      if (!geocoder) return;

      const response = await geocoder.geocode({
        location: { lat, lng },
      });

      if (response.results.length > 0) {
        setFormData((current) => ({
          ...current,
          location: response.results[0].formatted_address,
          latitude: String(lat),
          longitude: String(lng),
        }));
      } else {
        setError(
          "Coordinates selected, but no readable address was found."
        );
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      setError(
        "Location selected, but its address could not be retrieved."
      );
    }
  };

  useEffect(() => {
    let cancelled = false;
    let autocompleteElement;
    let placeListener;
    let mapClickListener;
    let markerDragListener;

    async function initializeMap() {
      if (!apiKey) {
        setError(
          "Google Maps API key is missing. Check your frontend .env file."
        );
        return;
      }

      try {
        const [maps, places, geocoding] = await Promise.all([
          importLibrary("maps"),
          importLibrary("places"),
          importLibrary("geocoding"),
        ]);

        if (cancelled || !mapContainerRef.current) return;

        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: 13.0827, lng: 80.2707 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const marker = new google.maps.Marker({
          map,
          visible: false,
          draggable: true,
          title: "Selected animal location",
        });

        const geocoder = new geocoding.Geocoder();

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;

        // Allow users to select a location by clicking the map.
        mapClickListener = map.addListener("click", async (event) => {
          if (!event.latLng) return;

          setError("");
          await updateLocation(
            event.latLng.lat(),
            event.latLng.lng()
          );
        });

        // Update coordinates if the marker is dragged.
        markerDragListener = marker.addListener(
          "dragend",
          async (event) => {
            if (!event.latLng) return;

            setError("");
            await updateLocation(
              event.latLng.lat(),
              event.latLng.lng()
            );
          }
        );

        // Google Places Autocomplete widget.
        autocompleteElement =
          new places.PlaceAutocompleteElement({});

        autocompleteElement.placeholder =
          "Search for the animal's address";

        autocompleteRef.current = autocompleteElement;

        placeListener = async (event) => {
          try {
            if (!event.placePrediction) return;

            const place = event.placePrediction.toPlace();

            await place.fetchFields({
              fields: ["formattedAddress", "location"],
            });

            if (!place.location) {
              setError("No coordinates found for this address.");
              return;
            }

            setError("");

            await updateLocation(
              place.location.lat(),
              place.location.lng(),
              place.formattedAddress || ""
            );

            map.setZoom(16);
          } catch (err) {
            console.error("Address lookup failed:", err);
            setError(
              "Could not retrieve that address. Please try again."
            );
          }
        };

        autocompleteElement.addEventListener(
          "gmp-select",
          placeListener
        );

        const container = document.getElementById(
          "rescue-autocomplete-container"
        );

        if (container) {
          container.replaceChildren(autocompleteElement);
        }

        setMapReady(true);
      } catch (err) {
        console.error("Google Maps initialization failed:", err);
        if (!cancelled) {
          setError(
            "Unable to load Google Maps. Check your API key, API restrictions, billing, and internet connection."
          );
        }
      }
    }

    initializeMap();

    return () => {
      cancelled = true;

      if (mapClickListener) {
        google.maps.event.removeListener(mapClickListener);
      }

      if (markerDragListener) {
        google.maps.event.removeListener(markerDragListener);
      }

      if (autocompleteElement && placeListener) {
        autocompleteElement.removeEventListener(
          "gmp-select",
          placeListener
        );
      }

      autocompleteElement?.remove();
      mapRef.current = null;
      markerRef.current = null;
      geocoderRef.current = null;
      autocompleteRef.current = null;
    };
  }, []);

  // Use the browser's built-in location permission.
  const handleCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location sharing.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateLocation(
            position.coords.latitude,
            position.coords.longitude
          );

          mapRef.current?.setZoom(16);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);

        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. Please allow location access or search for an address."
          );
        } else if (err.code === err.TIMEOUT) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            "Unable to get your current location. Try searching for an address."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setVetError("");
    setNearbyVets([]);
    setSubmittedLocation(null);

    if (!formData.description.trim()) {
      setError("Please describe the animal and its situation.");
      return;
    }

    if (
      !formData.location.trim() ||
      formData.latitude === "" ||
      formData.longitude === ""
    ) {
      setError(
        "Please search for an address, share your current location, or select a point on the map."
      );
      return;
    }

    const reportLocation = {
      address: formData.location.trim(),
      lat: Number(formData.latitude),
      lng: Number(formData.longitude),
    };

    try {
      setSubmitting(true);

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const reportData = {
        animal_type: formData.animal_type,
        description: formData.description.trim(),
        location: reportLocation.address,
        latitude: reportLocation.lat,
        longitude: reportLocation.lng,
        image_url: imageUrl,
        severity: formData.severity,
      };

      await createRescueReport(reportData);

      setSuccess("Rescue report submitted successfully!");
      setSubmittedLocation(reportLocation);

      // Clear the form but keep the submitted coordinates for the vet search.
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

      if (markerRef.current) {
        markerRef.current.setVisible(false);
      }

      // Reset the address autocomplete without reinitializing the map.
      const container = document.getElementById(
        "rescue-autocomplete-container"
      );

      if (container && autocompleteRef.current) {
        const oldElement = autocompleteRef.current;
        const newElement = new google.maps.places.PlaceAutocompleteElement();
        newElement.placeholder = "Search for the animal's address";
        oldElement.replaceWith(newElement);
        autocompleteRef.current = newElement;

        newElement.addEventListener("gmp-select", async (event) => {
          try {
            if (!event.placePrediction) return;
            const place = event.placePrediction.toPlace();
            await place.fetchFields({
              fields: ["formattedAddress", "location"],
            });

            if (place.location) {
              await updateLocation(
                place.location.lat(),
                place.location.lng(),
                place.formattedAddress || ""
              );
              mapRef.current?.setZoom(16);
            }
          } catch (err) {
            console.error("Address lookup failed:", err);
            setError("Could not retrieve that address.");
          }
        });
      }

      // A Places API error must not make a successfully saved report look failed.
      setLoadingVets(true);
      try {
        const { Place } = await importLibrary("places");
        const { places = [] } = await Place.searchNearby({
          fields: [
            "displayName",
            "formattedAddress",
            "location",
            "nationalPhoneNumber",
            "googleMapsURI",
          ],
          locationRestriction: {
            center: { lat: reportLocation.lat, lng: reportLocation.lng },
            radius: 5000,
          },
          includedPrimaryTypes: ["veterinary_care"],
          maxResultCount: 10,
        });

        setNearbyVets(places);
        if (places.length === 0) {
          setVetError(
            "No veterinary clinics were found within 5 km. You can try opening Google Maps to search nearby."
          );
        }
      } catch (placesErr) {
        console.error("Nearby veterinary search failed:", placesErr);
        setVetError(
          "The report was saved, but nearby clinics could not be loaded. Check your Places API (New) setup and try again."
        );
      } finally {
        setLoadingVets(false);
      }
    } catch (err) {
      console.error("Error creating rescue report:", err);
      setError(err.message || "Failed to submit rescue report.");
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
          <p className="error-message" role="alert">
            {error}
          </p>
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

          <div className="form-group location-form-group">
            <label>Location / Address</label>

            <div
              id="rescue-autocomplete-container"
              className="rescue-autocomplete-container"
            />

            <button
              type="button"
              className="current-location-btn"
              onClick={handleCurrentLocation}
              disabled={locating || !mapReady}
            >
              {locating
                ? "Finding your location..."
                : "Use my current location"}
            </button>

            <p className="location-help-text">
              Search for an address or use your current location.
              You can also click the map or drag the marker to adjust it.
            </p>

            <div
              ref={mapContainerRef}
              className="rescue-location-map"
              aria-label="Map for selecting the animal's location"
            />

            {formData.location && (
              <p className="selected-location">
                <strong>Selected address:</strong>{" "}
                {formData.location}
              </p>
            )}
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
                readOnly
                placeholder="Selected automatically"
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
                readOnly
                placeholder="Selected automatically"
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

        {submittedLocation && (
          <section className="nearby-vets-section" aria-live="polite">
            <h2>Nearby Veterinary Clinics</h2>
            <p className="nearby-vets-intro">
              Suggestions near the reported animal location:
              <strong> {submittedLocation.address}</strong>
            </p>

            {loadingVets && (
              <p className="nearby-vets-status" role="status">
                Searching for nearby veterinary clinics...
              </p>
            )}

            {!loadingVets && vetError && (
              <p className="nearby-vets-message" role="status">
                {vetError}
              </p>
            )}

            {nearbyVets.length > 0 && (
              <div className="nearby-vets-list">
                {nearbyVets.map((vet, index) => {
                  const directionsUrl = vet.location
                    ? `https://www.google.com/maps/dir/?api=1&destination=${vet.location.lat()},${vet.location.lng()}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        vet.formattedAddress || vet.displayName
                      )}`;

                  return (
                    <article
                      className="nearby-vet-card"
                      key={vet.id || `${vet.displayName || "vet"}-${index}`}
                    >
                      <h3>{vet.displayName || "Veterinary Clinic"}</h3>
                      {vet.formattedAddress && (
                        <p className="nearby-vet-address">
                          <strong>Address:</strong> {vet.formattedAddress}
                        </p>
                      )}
                      {vet.nationalPhoneNumber && (
                        <p className="nearby-vet-phone">
                          <strong>Phone:</strong>{" "}
                          <a href={`tel:${vet.nationalPhoneNumber}`}>
                            {vet.nationalPhoneNumber}
                          </a>
                        </p>
                      )}
                      <a
                        className="nearby-vet-directions"
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get directions
                      </a>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="nearby-vets-disclaimer">
              Clinic details are provided by Google Maps and may not include
              every nearby veterinary service. Please confirm availability
              before travelling.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}

export default AddRescueReport;
