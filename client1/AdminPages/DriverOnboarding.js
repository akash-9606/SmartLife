// import { useState, useEffect } from "react";
// import "../styles/DriverOnboarding.css";
// import axios from "axios";

// export default function DriverOnboarding() {
//   const [drivers, setDrivers] = useState([]);
//   const [form, setForm] = useState({
//     id: null,
//     name: "",
//     phone: "",
//     email: "",
//     address: "",
//     ambulanceType: "",
//     licenseNumber: "",
//     commission: 3,
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [errors, setErrors] = useState({});

//   const YOUR_GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
//   const apiUrl = "http://localhost:3001/api/drivers";

//   useEffect(() => {
//     fetchDrivers();
//   }, []);

//   const fetchDrivers = async () => {
//     try {
//       const response = await axios.get(apiUrl);
//       setDrivers(response.data || []);
//     } catch (error) {
//       console.error("Error fetching drivers:", error);
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     const errs = {};
//     if (!form.name.trim()) errs.name = "Name is required";
//     if (!form.phone.trim()) errs.phone = "Phone is required";
//     if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = "Phone must be 10 digits";
//     if (!form.email.trim()) errs.email = "Email is required";
//     if (!/\S+@\S+\.\S+/.test(form.email))
//       errs.email = "Email format is invalid";
//     if (!form.address.trim()) errs.address = "Address is required";
//     if (!form.ambulanceType.trim())
//       errs.ambulanceType = "Ambulance type is required";
//     if (!form.licenseNumber.trim())
//       errs.licenseNumber = "License number is required";
//     if (Number(form.commission) < 3 || Number(form.commission) > 5)
//       errs.commission = "Commission must be between 3% and 5%";
//     return errs;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     const geoRes = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//         form.address
//       )}&key=${YOUR_GOOGLE_MAPS_API_KEY}`
//     );
//     const geoData = await geoRes.json();
//     if (!geoData.results || geoData.results.length === 0) {
//       alert("Failed to geocode the address. Please check the address.");
//       return;
//     }

//     const { lat, lng } = geoData.results[0].geometry.location;

//     const payload = {
//       name: form.name.trim(),
//       phone: form.phone.trim(),
//       email: form.email.trim(),
//       address: form.address.trim(),
//       location: { type: "Point", coordinates: [lng, lat] },
//       ambulanceType: form.ambulanceType.trim(),
//       licenseNumber: form.licenseNumber.trim(),
//       commission: Number(form.commission),
//     };

//     try {
//       if (isEditing) {
//         await axios.put(`${apiUrl}/${form.id}`, payload, {
//           withCredentials: true,
//         });
//         alert("Driver updated successfully!");
//       } else {
//         await axios.post(apiUrl, payload, {
//           withCredentials: true,
//         });
//         alert("Driver added successfully!");
//       }

//       await fetchDrivers();
//       resetForm();
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Failed to save driver. Please try again.");
//     }
//   };

//   const handleEdit = (driver) => {
//     setForm({
//       id: driver._id || driver.id,
//       name: driver.name,
//       phone: driver.phone || "",
//       email: driver.email || "",
//       address: driver.address || "",
//       ambulanceType: driver.ambulanceType || "",
//       licenseNumber: driver.licenseNumber || "",
//       commission: driver.commission || 3,
//     });
//     setIsEditing(true);
//     setErrors({});
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this driver?")) {
//       try {
//         await axios.delete(`${apiUrl}/${id}`, {
//           withCredentials: true,
//         });
//         setDrivers((prev) => prev.filter((d) => (d._id || d.id) !== id));
//         alert("Driver deleted successfully!");
//       } catch (error) {
//         console.error("Error deleting driver:", error);
//         alert("Failed to delete driver.");
//       }
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       id: null,
//       name: "",
//       phone: "",
//       email: "",
//       address: "",
//       ambulanceType: "",
//       licenseNumber: "",
//       commission: 3,
//     });
//     setIsEditing(false);
//     setErrors({});
//   };

//   return (
//     <div className="poa-dashboard-container">
//       <div className="poa-main-content">
//         <h2>Driver Onboarding</h2>
//         <form className="poa-form" onSubmit={handleSubmit}>
//           <input
//             className="poa-input-text"
//             name="name"
//             placeholder="Name"
//             value={form.name}
//             onChange={handleChange}
//           />
//           {errors.name && <small className="poa-error">{errors.name}</small>}

//           <input
//             className="poa-input-text"
//             name="phone"
//             placeholder="Phone"
//             value={form.phone}
//             onChange={handleChange}
//           />
//           {errors.phone && <small className="poa-error">{errors.phone}</small>}

//           <input
//             className="poa-input-text"
//             name="email"
//             placeholder="Email"
//             value={form.email}
//             onChange={handleChange}
//           />
//           {errors.email && <small className="poa-error">{errors.email}</small>}

//           <input
//             className="poa-input-text"
//             name="address"
//             placeholder="Address"
//             value={form.address}
//             onChange={handleChange}
//           />
//           {errors.address && (
//             <small className="poa-error">{errors.address}</small>
//           )}

//           <input
//             className="poa-input-text"
//             name="ambulanceType"
//             placeholder="Ambulance Type"
//             value={form.ambulanceType}
//             onChange={handleChange}
//           />
//           {errors.ambulanceType && (
//             <small className="poa-error">{errors.ambulanceType}</small>
//           )}

//           <input
//             className="poa-input-text"
//             name="licenseNumber"
//             placeholder="License Number"
//             value={form.licenseNumber}
//             onChange={handleChange}
//           />
//           {errors.licenseNumber && (
//             <small className="poa-error">{errors.licenseNumber}</small>
//           )}

//           <input
//             className="poa-input-number"
//             name="commission"
//             type="number"
//             min="3"
//             max="5"
//             step="0.1"
//             value={form.commission}
//             onChange={handleChange}
//           />
//           {errors.commission && (
//             <small className="poa-error">{errors.commission}</small>
//           )}

//           <div className="poa-form-buttons">
//             <button type="submit" className="poa-submit-btn">
//               {isEditing ? "Update Driver" : "Add Driver"}
//             </button>
//             {isEditing && (
//               <button
//                 className="poa-cancel-btn"
//                 type="button"
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>

//         <h3 className="poa-partners-heading">Drivers List</h3>
//         <table className="poa-table">
//           <thead>
//             <tr>
//               <th>S. No</th>
//               <th>Name</th>
//               <th>Phone</th>
//               <th>Ambulance Type</th>
//               <th>License</th>
//               <th>Commission</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {drivers.map((d, idx) => (
//               <tr key={d._id || d.id}>
//                 <td>{idx + 1}</td>
//                 <td>{d.name}</td>
//                 <td>{d.phone}</td>
//                 <td>{d.ambulanceType}</td>
//                 <td>{d.licenseNumber}</td>
//                 <td>{d.commission}%</td>
//                 <td>
//                   <button
//                     className="poa-edit-btn"
//                     onClick={() => handleEdit(d)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="poa-delete-btn"
//                     onClick={() => handleDelete(d._id || d.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import "../styles/DriverOnboarding.css";
import axios from "axios";

export default function DriverOnboarding() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    phone: "",
    email: "",
    address: "",
    ambulanceType: "",
    licenseNumber: "",
    commission: 3,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const YOUR_GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const apiUrl = "http://localhost:3001/api/driver-onboarding";

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(apiUrl);
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = "Phone must be 10 digits";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Email format is invalid";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.ambulanceType.trim())
      errs.ambulanceType = "Ambulance type is required";
    if (!form.licenseNumber.trim())
      errs.licenseNumber = "License number is required";
    if (Number(form.commission) < 3 || Number(form.commission) > 5)
      errs.commission = "Commission must be between 3% and 5%";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        form.address
      )}&key=${YOUR_GOOGLE_MAPS_API_KEY}`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      alert("Failed to geocode the address. Please check the address.");
      return;
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      location: { type: "Point", coordinates: [lng, lat] },
      ambulanceType: form.ambulanceType.trim(),
      licenseNumber: form.licenseNumber.trim(),
      commission: Number(form.commission),
    };

    try {
      if (isEditing) {
        await axios.put(`${apiUrl}/${form.id}`, payload, {
          withCredentials: true,
        });
        alert("Driver updated successfully!");
      } else {
        await axios.post(apiUrl, payload, {
          withCredentials: true,
        });
        alert("Driver added successfully!");
      }

      await fetchDrivers();
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save driver. Please try again.");
    }
  };

  const handleEdit = (driver) => {
    setForm({
      id: driver._id || driver.id,
      name: driver.name,
      phone: driver.phone || "",
      email: driver.email || "",
      address: driver.address || "",
      ambulanceType: driver.ambulanceType || "",
      licenseNumber: driver.licenseNumber || "",
      commission: driver.commission || 3,
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await axios.delete(`${apiUrl}/${id}`, {
          withCredentials: true,
        });
        setDrivers((prev) => prev.filter((d) => (d._id || d.id) !== id));
        alert("Driver deleted successfully!");
      } catch (error) {
        console.error("Error deleting driver:", error);
        alert("Failed to delete driver.");
      }
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      phone: "",
      email: "",
      address: "",
      ambulanceType: "",
      licenseNumber: "",
      commission: 3,
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="poa-dashboard-container">
      <div className="poa-main-content">
        <h2>Driver Onboarding</h2>
        <form className="poa-form" onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            className="poa-input-text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <small className="poa-error">{errors.name}</small>}

          <label>Phone:</label>
          <input
            className="poa-input-text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <small className="poa-error">{errors.phone}</small>}

          <label>Email:</label>
          <input
            className="poa-input-text"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <small className="poa-error">{errors.email}</small>}

          <label>Address:</label>
          <input
            className="poa-input-text"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          {errors.address && (
            <small className="poa-error">{errors.address}</small>
          )}

          <label>Ambulance Type:</label>
          <input
            className="poa-input-text"
            name="ambulanceType"
            value={form.ambulanceType}
            onChange={handleChange}
          />
          {errors.ambulanceType && (
            <small className="poa-error">{errors.ambulanceType}</small>
          )}

          <label>License Number:</label>
          <input
            className="poa-input-text"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
          />
          {errors.licenseNumber && (
            <small className="poa-error">{errors.licenseNumber}</small>
          )}

          <label>Commission (%):</label>
          <input
            className="poa-input-number"
            name="commission"
            type="number"
            min="3"
            max="5"
            step="0.1"
            value={form.commission}
            onChange={handleChange}
          />
          {errors.commission && (
            <small className="poa-error">{errors.commission}</small>
          )}

          <div className="poa-form-buttons">
            <button type="submit" className="poa-submit-btn">
              {isEditing ? "Update Driver" : "Add Driver"}
            </button>
            {isEditing && (
              <button
                className="poa-cancel-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="poa-partners-heading">Drivers List</h3>
        <table className="poa-table">
          <thead>
            <tr>
              <th>S. No</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Ambulance Type</th>
              <th>License</th>
              <th>Commission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, idx) => (
              <tr key={d._id || d.id}>
                <td>{idx + 1}</td>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.ambulanceType}</td>
                <td>{d.licenseNumber}</td>
                <td>{d.commission}%</td>
                <td>
                  <button
                    className="poa-btn poa-edit-btn"
                    onClick={() => handleEdit(d)}
                  >
                    Edit
                  </button>
                  <button
                    className="poa-btn poa-delete-btn"
                    onClick={() => handleDelete(d._id || d.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
