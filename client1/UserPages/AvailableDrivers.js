// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "../styles/AvailableDrivers.css";

// const AvailableDrivers = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const [drivers, setDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [pickupToDestDistance, setPickupToDestDistance] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const driversPerPage = 16;

//   useEffect(() => {
//     const fetchAmbulanceNearPickup = async () => {
//       try {
//         if (!window.google || !window.google.maps) {
//           setError("Google Maps failed to load.");
//           setLoading(false);
//           return;
//         }

//         const geocoder = new window.google.maps.Geocoder();
//         const directionsService = new window.google.maps.DirectionsService();
//         const placesService = new window.google.maps.places.PlacesService(
//           document.createElement("div")
//         );

//         geocoder.geocode(
//           { address: state.pickup },
//           (pickupResults, pickupStatus) => {
//             if (pickupStatus !== "OK" || pickupResults.length === 0) {
//               setError("Unable to locate pickup address.");
//               setLoading(false);
//               return;
//             }

//             const pickupLocation = pickupResults[0].geometry.location;

//             // Calculate pickup → destination distance
//             if (state.destination) {
//               geocoder.geocode(
//                 { address: state.destination },
//                 (destResults, destStatus) => {
//                   if (destStatus === "OK" && destResults.length > 0) {
//                     const destinationLocation =
//                       destResults[0].geometry.location;

//                     directionsService.route(
//                       {
//                         origin: pickupLocation,
//                         destination: destinationLocation,
//                         travelMode: window.google.maps.TravelMode.DRIVING,
//                       },
//                       (result, status) => {
//                         if (status === "OK" && result.routes[0]?.legs[0]) {
//                           setPickupToDestDistance(
//                             result.routes[0].legs[0].distance.text
//                           );
//                         }
//                       }
//                     );
//                   }
//                 }
//               );
//             }

//             // Search for ambulances near pickup location
//             const request = {
//               location: pickupLocation,
//               rankBy: window.google.maps.places.RankBy.DISTANCE,
//               keyword: "ambulance",
//             };

//             placesService.nearbySearch(request, async (results, status) => {
//               if (status !== "OK" || !results?.length) {
//                 setError("No ambulance services found.");
//                 setLoading(false);
//                 return;
//               }

//               const driverPromises = results.map((place) => {
//                 return new Promise((resolvePlace) => {
//                   placesService.getDetails(
//                     {
//                       placeId: place.place_id,
//                       fields: [
//                         "name",
//                         "formatted_address",
//                         "geometry",
//                         "rating",
//                         "formatted_phone_number",
//                       ],
//                     },
//                     (details, detailsStatus) => {
//                       if (detailsStatus === "OK" && details) {
//                         directionsService.route(
//                           {
//                             origin: pickupLocation,
//                             destination: details.geometry.location,
//                             travelMode: window.google.maps.TravelMode.DRIVING,
//                           },
//                           (result, status) => {
//                             if (status === "OK" && result.routes[0]?.legs[0]) {
//                               const leg = result.routes[0].legs[0];
//                               resolvePlace({
//                                 name: details.name,
//                                 address: details.formatted_address,
//                                 location: {
//                                   lat: details.geometry.location.lat(),
//                                   lng: details.geometry.location.lng(),
//                                 },
//                                 distance: leg.distance.text,
//                                 duration: leg.duration.text,
//                                 cost: `₹${(50 + Math.random() * 200).toFixed(
//                                   0
//                                 )}`,
//                                 rating: details.rating || "N/A",
//                                 phone:
//                                   details.formatted_phone_number ||
//                                   "Not available",
//                                 vicinity: details.formatted_address,
//                                 place_id: place.place_id,
//                               });
//                             } else {
//                               resolvePlace(null);
//                             }
//                           }
//                         );
//                       } else {
//                         resolvePlace(null);
//                       }
//                     }
//                   );
//                 });
//               });

//               const enriched = (await Promise.all(driverPromises)).filter(
//                 Boolean
//               );
//               if (enriched.length === 0) {
//                 setError("No ambulance contacts found.");
//               } else {
//                 setDrivers(enriched);
//               }
//               setLoading(false);
//             });
//           }
//         );
//       } catch (err) {
//         console.error("Google Maps error:", err);
//         setError("Something went wrong while loading ambulance data.");
//         setLoading(false);
//       }
//     };

//     fetchAmbulanceNearPickup();
//   }, [state.pickup, state.destination]);

//   const handleBookNow = (driver) => {
//     navigate("/nearby-hospitals/book-ambulance", {
//       state: {
//         hospital: {
//           name: driver.name,
//           address: driver.address,
//           rating: driver.rating,
//           phone: driver.phone,
//           place_id: driver.place_id,
//           vicinity: driver.vicinity,
//           distance: driver.distance,
//           lat: driver.location.lat,
//           lng: driver.location.lng,
//           cost: driver.cost,
//           duration: driver.duration,
//         },
//         pickupLocation: state.pickup,
//         destAddress: state.destination || "",
//       },
//     });
//   };

//   const totalPages = Math.ceil(drivers.length / driversPerPage);
//   const paginatedDrivers = drivers.slice(
//     (currentPage - 1) * driversPerPage,
//     currentPage * driversPerPage
//   );

//   return (
//     <div className="driver-list-container">
//       <h2>Ambulance Services Near</h2>
//       <p>
//         <strong>{state.pickup}</strong>
//         {state.destination && (
//           <>
//             {" "}
//             → <strong>{state.destination}</strong>
//           </>
//         )}
//       </p>

//       {pickupToDestDistance && (
//         <p>
//           🚗 <strong>Pickup → Destination Distance:</strong>{" "}
//           {pickupToDestDistance}
//         </p>
//       )}

//       {loading && <p>Loading ambulance drivers...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           <ul className="driver-list">
//             {paginatedDrivers.map((h, idx) => (
//               <li key={idx} className="driver-card">
//                 <h3>{h.name}</h3>
//                 <div className="hospital-details">
//                   <div className="hospital-detail">
//                     <span className="label">📍</span>
//                     <span className="value">{h.vicinity}</span>
//                   </div>
//                   <div className="hospital-detail">
//                     <span className="label">🚗</span>
//                     <span className="value">{h.distance}</span>
//                   </div>
//                   <div className="hospital-detail">
//                     <span className="label">⏱</span>
//                     <span className="value">{h.duration}</span>
//                   </div>
//                   <div className="hospital-detail">
//                     <span className="label">💸</span>
//                     <span className="value">{h.cost}</span>
//                   </div>
//                   <div className="hospital-detail">
//                     <span className="label">⭐</span>
//                     <span className="value">{h.rating}</span>
//                   </div>
//                 </div>
//                 <button onClick={() => handleBookNow(h)}>Book Now</button>
//               </li>
//             ))}
//           </ul>

//           {drivers.length > driversPerPage && (
//             <div className="pagination">
//               <button
//                 className="page-btn"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 ◀ Prev
//               </button>
//               {Array.from({ length: totalPages }, (_, idx) => (
//                 <button
//                   key={idx}
//                   className={`page-btn ${
//                     currentPage === idx + 1 ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(idx + 1)}
//                 >
//                   {idx + 1}
//                 </button>
//               ))}
//               <button
//                 className="page-btn"
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 Next ▶
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AvailableDrivers;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/AvailableDrivers.css";

const AvailableDrivers = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickupToDestDistance, setPickupToDestDistance] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const driversPerPage = 16;

  useEffect(() => {
    const fetchAmbulanceNearPickup = async () => {
      try {
        if (!window.google || !window.google.maps) {
          setError("Google Maps failed to load.");
          setLoading(false);
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        const directionsService = new window.google.maps.DirectionsService();
        const placesService = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );

        geocoder.geocode(
          { address: state.pickup },
          (pickupResults, pickupStatus) => {
            if (pickupStatus !== "OK" || pickupResults.length === 0) {
              setError("Unable to locate pickup address.");
              setLoading(false);
              return;
            }

            const pickupLocation = pickupResults[0].geometry.location;

            // Calculate pickup → destination distance
            if (state.destination) {
              geocoder.geocode(
                { address: state.destination },
                (destResults, destStatus) => {
                  if (destStatus === "OK" && destResults.length > 0) {
                    const destinationLocation =
                      destResults[0].geometry.location;

                    directionsService.route(
                      {
                        origin: pickupLocation,
                        destination: destinationLocation,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                      },
                      (result, status) => {
                        if (status === "OK" && result.routes[0]?.legs[0]) {
                          setPickupToDestDistance(
                            result.routes[0].legs[0].distance.text
                          );
                        }
                      }
                    );
                  }
                }
              );
            }

            // ✅ Search for ambulances near pickup location within 50 km
            const request = {
              location: pickupLocation,
              radius: 100000, // 50 kilometers
              keyword: "ambulance",
            };

            placesService.nearbySearch(request, async (results, status) => {
              if (status !== "OK" || !results?.length) {
                setError("No ambulance services found.");
                setLoading(false);
                return;
              }

              const driverPromises = results.map((place) => {
                return new Promise((resolvePlace) => {
                  placesService.getDetails(
                    {
                      placeId: place.place_id,
                      fields: [
                        "name",
                        "formatted_address",
                        "geometry",
                        "rating",
                        "formatted_phone_number",
                      ],
                    },
                    (details, detailsStatus) => {
                      if (detailsStatus === "OK" && details) {
                        directionsService.route(
                          {
                            origin: pickupLocation,
                            destination: details.geometry.location,
                            travelMode: window.google.maps.TravelMode.DRIVING,
                          },
                          (result, status) => {
                            if (status === "OK" && result.routes[0]?.legs[0]) {
                              const leg = result.routes[0].legs[0];
                              resolvePlace({
                                name: details.name,
                                address: details.formatted_address,
                                location: {
                                  lat: details.geometry.location.lat(),
                                  lng: details.geometry.location.lng(),
                                },
                                distance: leg.distance.text,
                                duration: leg.duration.text,
                                cost: `₹${(50 + Math.random() * 200).toFixed(
                                  0
                                )}`,
                                rating: details.rating || "N/A",
                                phone:
                                  details.formatted_phone_number ||
                                  "Not available",
                                vicinity: details.formatted_address,
                                place_id: place.place_id,
                              });
                            } else {
                              resolvePlace(null);
                            }
                          }
                        );
                      } else {
                        resolvePlace(null);
                      }
                    }
                  );
                });
              });

              const enriched = (await Promise.all(driverPromises)).filter(
                Boolean
              );
              if (enriched.length === 0) {
                setError("No ambulance contacts found.");
              } else {
                setDrivers(enriched);
              }
              setLoading(false);
            });
          }
        );
      } catch (err) {
        console.error("Google Maps error:", err);
        setError("Something went wrong while loading ambulance data.");
        setLoading(false);
      }
    };

    fetchAmbulanceNearPickup();
  }, [state.pickup, state.destination]);

  const handleBookNow = (driver) => {
    navigate("/nearby-hospitals/book-ambulance", {
      state: {
        hospital: {
          name: driver.name,
          address: driver.address,
          rating: driver.rating,
          phone: driver.phone,
          place_id: driver.place_id,
          vicinity: driver.vicinity,
          distance: driver.distance,
          lat: driver.location.lat,
          lng: driver.location.lng,
          cost: driver.cost,
          duration: driver.duration,
        },
        pickupLocation: state.pickup,
        destAddress: state.destination || "",
      },
    });
  };

  const totalPages = Math.ceil(drivers.length / driversPerPage);
  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * driversPerPage,
    currentPage * driversPerPage
  );

  return (
    <div className="driver-list-container">
      <h2>Ambulance Services Near</h2>
      <p>
        <strong>{state.pickup}</strong>
        {state.destination && (
          <>
            {" "}
            → <strong>{state.destination}</strong>
          </>
        )}
      </p>

      {pickupToDestDistance && (
        <p>
          🚗 <strong>Pickup → Destination Distance:</strong>{" "}
          {pickupToDestDistance}
        </p>
      )}

      {loading && <p>Loading ambulance drivers...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <ul className="driver-list">
            {paginatedDrivers.map((h, idx) => (
              <li key={idx} className="driver-card">
                <h3>{h.name}</h3>
                <div className="hospital-details">
                  <div className="hospital-detail">
                    <span className="label">📍</span>
                    <span className="value">{h.vicinity}</span>
                  </div>
                  <div className="hospital-detail">
                    <span className="label">🚗</span>
                    <span className="value">{h.distance}</span>
                  </div>
                  <div className="hospital-detail">
                    <span className="label">⏱</span>
                    <span className="value">{h.duration}</span>
                  </div>
                  <div className="hospital-detail">
                    <span className="label">💸</span>
                    <span className="value">{h.cost}</span>
                  </div>
                  <div className="hospital-detail">
                    <span className="label">⭐</span>
                    <span className="value">{h.rating}</span>
                  </div>
                </div>
                <button onClick={() => handleBookNow(h)}>Book Now</button>
              </li>
            ))}
          </ul>

          {drivers.length > driversPerPage && (
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
                  className={`page-btn ${
                    currentPage === idx + 1 ? "active" : ""
                  }`}
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
        </>
      )}
    </div>
  );
};

export default AvailableDrivers;
