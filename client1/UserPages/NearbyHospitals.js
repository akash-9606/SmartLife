
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/NearbyHospitals.css";

const libraries = ["places"];
const ITEMS_PER_PAGE = 20;

function NearbyHospitalsList() {
  const { state } = useLocation();
  const pickupLocation = state?.pickup || "";
  const navigate = useNavigate();

  const [navigating, setNavigating] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const containerRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const enrichHospitals = useCallback(async (hospitalsList, originLocation) => {
    const directionsService = new window.google.maps.DirectionsService();

    const enrichedList = await Promise.all(
      hospitalsList.map(
        (hospital) =>
          new Promise((resolve) => {
            directionsService.route(
              {
                origin: originLocation,
                destination: hospital.geometry.location,
                travelMode: "DRIVING",
              },
              (result, status) => {
                if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
                  const leg = result.routes[0].legs[0];
                  const km = leg.distance?.text?.includes("km")
                    ? parseFloat(
                        leg.distance.text
                          .replace(/,/g, "")
                          .replace("km", "")
                          .trim()
                      )
                    : parseFloat(
                        leg.distance.text
                          .replace(/,/g, "")
                          .replace("m", "")
                          .trim()
                      ) / 1000;

                  resolve({
                    ...hospital,
                    distance: `${km.toFixed(2)} km`,
                    duration: leg.duration.text,
                    cost: `₹${Math.ceil(km * 45)}`,
                  });
                } else {
                  resolve({
                    ...hospital,
                    distance: "N/A",
                    duration: "N/A",
                    cost: "N/A",
                  });
                }
              }
            );
          })
      )
    );

    return enrichedList;
  }, []);

  const searchByAddress = useCallback(() => {
    if (!pickupLocation.trim()) {
      setError("Pickup location is not provided.");
      return;
    }

    if (!containerRef.current) {
      setError("Map container not ready yet, please wait.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchInitiated(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickupLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const request = {
          location,
          radius: 50000,
          type: "hospital",
        };

        const allHospitals = [];

        const fetchHospitals = (service, request, location) => {
          const processPage = (results, status, pagination) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results?.length
            ) {
              allHospitals.push(...results);
              if (pagination && pagination.hasNextPage) {
                setTimeout(() => pagination.nextPage(), 2000);
              } else {
                enrichHospitals(allHospitals, location)
                  .then((enriched) => {
                    setHospitals(enriched);
                    setLoading(false);
                  })
                  .catch(() => {
                    setError("Failed to enrich hospital data.");
                    setLoading(false);
                  });
              }
            } else {
              setHospitals([]);
              setLoading(false);
              setError("No hospitals found nearby.");
            }
          };

          service.nearbySearch(request, processPage);
        };

        const service = new window.google.maps.places.PlacesService(
          containerRef.current
        );
        fetchHospitals(service, request, location);
      } else {
        setLoading(false);
        setHospitals([]);
        setError("Pickup location not found. Please check the location.");
      }
    });
  }, [pickupLocation, enrichHospitals]);

  const navigateToBookAmbulancePage = (hospital) => {
    if (navigating) return;
    setNavigating(true);

    // Extract only serializable fields
    const safeHospitalData = {
      name: hospital.name,
      address: hospital.vicinity,
      place_id: hospital.place_id,
      rating: hospital.rating,
      distance: hospital.distance,
      duration: hospital.duration,
      cost: hospital.cost,
      location: {
        lat: hospital.geometry?.location?.lat?.(),
        lng: hospital.geometry?.location?.lng?.(),
      },
    };

    setTimeout(() => {
      navigate("/nearby-hospitals/book-ambulance", {
        state: {
          hospital: safeHospitalData,
          pickupLocation,
          destAddress: hospital.vicinity,
        },
      });
    }, 1000);
  };

  useEffect(() => {
    if (pickupLocation && isLoaded && !searchInitiated) {
      searchByAddress();
    }
  }, [pickupLocation, isLoaded, searchInitiated, searchByAddress]);

  const totalPages = Math.ceil(hospitals.length / ITEMS_PER_PAGE);
  const paginatedHospitals = hospitals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="hospitals-container">
      <h2>Nearby Hospitals</h2>
      <p>
        <strong>Pickup Location:</strong> {pickupLocation || "Not provided"}
      </p>
      <div ref={containerRef} style={{ display: "none" }} />

      {loading && <p>Loading nearby hospitals...</p>}
      {error && !loading && <p className="error-message">{error}</p>}

      {!loading && paginatedHospitals.length > 0 && (
        <ul className="hospital-list">
          {paginatedHospitals.map((hospital) => (
            <li
              key={hospital.place_id}
              className="hospital-card"
              onClick={() => navigateToBookAmbulancePage(hospital)}
            >
              <h3>{hospital.name}</h3>
              <p>
                <strong>Address:</strong> {hospital.vicinity}
              </p>
              <p>
                <strong>Distance:</strong> {hospital.distance}
              </p>
              <p>
                <strong>Duration:</strong> {hospital.duration}
              </p>
              <p>
                <strong>Cost:</strong> {hospital.cost}
              </p>
              <p>
                <strong>Rating:</strong> {hospital.rating || "Not Available"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!loading && hospitals.length > 0 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ◀ Prev
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default NearbyHospitalsList;
