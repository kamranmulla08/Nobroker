import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./MyInterests.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function MyInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_BASE_URL}/api/properties/interests/mine/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to load your interests."
          );
        }

        setInterests(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="my-interests-page">
          <div className="my-interests-loading">
            Loading your interests...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="my-interests-page">
        <div className="my-interests-container">

          <div className="page-header">
            <h1>My Interests</h1>
            <p>
              Properties you have shown interest in.
            </p>
          </div>

          {error && (
            <div className="interest-page-error">
              {error}
            </div>
          )}

          {!error && interests.length === 0 && (
            <div className="no-interests">
              <h2>No interests yet</h2>

              <p>
                You haven't shown interest in any
                properties yet.
              </p>

              <Link to="/properties">
                Browse Properties
              </Link>
            </div>
          )}

          {!error && interests.length > 0 && (
            <div className="interests-list">
              {interests.map((interest) => {
                const property =
                  interest.property_details ||
                  interest.property;

                if (!property) {
                  return null;
                }

                const image =
                  property.images?.[0]?.image;

                const imageUrl = image
                  ? image.startsWith("http")
                    ? image
                    : `${API_BASE_URL}${image}`
                  : null;

                return (
                  <div
                    className="interest-card"
                    key={interest.id}
                  >
                    <div className="interest-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.title}
                        />
                      ) : (
                        <div className="no-interest-image">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="interest-content">
                      <h2>
                        {property.title}
                      </h2>

                      <p className="interest-location">
                        📍{" "}
                        {property.address ||
                          property.city}
                      </p>

                      <p className="interest-price">
                        ₹
                        {Number(
                          property.price
                        ).toLocaleString("en-IN")}
                      </p>

                      <div className="interest-meta">
                        <span>
                          {property.bedrooms} BHK
                        </span>

                        <span>
                          {property.bathrooms} Bath
                        </span>

                        <span>
                          {property.area} sq.ft
                        </span>
                      </div>

                      <div className="interest-status">
                        Status:{" "}
                        <strong>
                          {interest.status ||
                            "PENDING"}
                        </strong>
                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="view-property-button"
                      >
                        View Property
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </>
  );
}

export default MyInterests;