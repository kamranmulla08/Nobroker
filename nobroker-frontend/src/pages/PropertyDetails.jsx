import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./PropertyDetails.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const [interestLoading, setInterestLoading] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [interestError, setInterestError] = useState("");

  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/properties/${id}/`
        );

        if (!response.ok) {
          throw new Error("Property not found");
        }

        const data = await response.json();

        setProperty(data);
        setActiveImage(0);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleInterest = async () => {
    if (!isAuthenticated) {
      setInterestError("Please login to show interest.");
      return;
    }

    if (user?.role !== "BUYER") {
      setInterestError(
        "Only buyers can submit interest requests."
      );
      return;
    }

    try {
      setInterestLoading(true);
      setInterestMessage("");
      setInterestError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${id}/interest/`,
        {
          method: "POST",
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
            data.message ||
            data.error ||
            data.non_field_errors?.[0] ||
            "Failed to submit interest."
        );
      }

      setInterestMessage(
        "Interest submitted successfully!"
      );
    } catch (err) {
      console.error(err);
      setInterestError(err.message);
    } finally {
      setInterestLoading(false);
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      setInterestError("Please login to chat with the owner.");
      return;
    }

    if (user?.role !== "BUYER") {
      setInterestError(
        "Only buyers can start a chat with the property owner."
      );
      return;
    }

    try {
      setChatLoading(true);
      setInterestMessage("");
      setInterestError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            property: property.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to start conversation."
        );
      }

      if (!data.conversation) {
        throw new Error(
          "Conversation was not returned by the server."
        );
      }

      navigate(`/chat/${data.conversation.id}`);
    } catch (err) {
      console.error(err);
      setInterestError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="property-details-page">
          <div className="property-details-loading">
            Loading property...
          </div>
        </main>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />

        <main className="property-details-page">
          <div className="property-details-error">
            <h2>Property not found</h2>

            <p>{error}</p>

            <Link to="/properties">
              Back to Properties
            </Link>
          </div>
        </main>
      </>
    );
  }

  const images = property.images || [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `${API_BASE_URL}${imagePath}`;
  };

  const nextImage = () => {
    if (images.length === 0) {
      return;
    }

    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const previousImage = () => {
    if (images.length === 0) {
      return;
    }

    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  return (
    <>
      <Navbar />

      <main className="property-details-page">
        <div className="property-details-container">

          <Link
            to="/properties"
            className="back-link"
          >
            ← Back to Properties
          </Link>

          {/* Property Image Gallery */}
          <section className="property-gallery">

            <div className="main-image-container">

              {images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(
                      images[activeImage].image
                    )}
                    alt={property.title}
                    className="main-property-image"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        className="gallery-button gallery-button-left"
                        onClick={previousImage}
                        aria-label="Previous image"
                      >
                        ‹
                      </button>

                      <button
                        className="gallery-button gallery-button-right"
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        ›
                      </button>

                      <div className="image-counter">
                        {activeImage + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-image">
                  No images available
                </div>
              )}

            </div>

            {images.length > 1 && (
              <div className="thumbnail-container">

                {images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`thumbnail-button ${
                      activeImage === index
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveImage(index)
                    }
                  >
                    <img
                      src={getImageUrl(image.image)}
                      alt={`${property.title} ${index + 1}`}
                      className="thumbnail-image"
                    />
                  </button>
                ))}

              </div>
            )}

          </section>

          {/* Property Information */}
          <section className="property-info">

            <div className="property-header">

              <div>
                <span className="property-type">
                  {property.property_type}
                </span>

                <span className="listing-type">
                  {property.listing_type}
                </span>
              </div>

              <span
                className={`availability ${
                  property.availability_status.toLowerCase()
                }`}
              >
                {property.availability_status}
              </span>

            </div>

            <h1>{property.title}</h1>

            <p className="property-location">
              📍 {property.address}
            </p>

            <div className="property-price">
              ₹
              {Number(property.price).toLocaleString(
                "en-IN"
              )}
            </div>

            {/* Property Features */}
            <div className="property-features">

              <div className="feature">
                <strong>
                  {property.bedrooms}
                </strong>

                <span>
                  Bedrooms
                </span>
              </div>

              <div className="feature">
                <strong>
                  {property.bathrooms}
                </strong>

                <span>
                  Bathrooms
                </span>
              </div>

              <div className="feature">
                <strong>
                  {property.area}
                </strong>

                <span>
                  sq ft
                </span>
              </div>

              <div className="feature">
                <strong>
                  {property.property_type}
                </strong>

                <span>
                  Type
                </span>
              </div>

            </div>

            {/* Description */}
            <div className="property-description">

              <h2>
                Description
              </h2>

              <p>
                {property.description}
              </p>

            </div>

            {/* Owner Information */}
            {property.owner_details && (
              <div className="property-owner">

                <h2>
                  Property Owner
                </h2>

                <p>
                  <strong>
                    {property.owner_details.name}
                  </strong>
                </p>

                <p>
                  Role:{" "}
                  {property.owner_details.role}
                </p>

              </div>
            )}

            {/* Action Buttons */}
            <div className="property-actions">

              <button
                className="interest-button"
                onClick={handleInterest}
                disabled={interestLoading}
              >
                {interestLoading
                  ? "Submitting..."
                  : "I'm Interested"}
              </button>

              <button
                className="chat-button"
                onClick={handleChat}
                disabled={chatLoading}
              >
                {chatLoading
                  ? "Opening Chat..."
                  : "Chat with Owner"}
              </button>

            </div>

            {/* Success Message */}
            {interestMessage && (
              <div className="interest-success">
                {interestMessage}
              </div>
            )}

            {/* Error Message */}
            {interestError && (
              <div className="interest-error">
                {interestError}
              </div>
            )}

          </section>

        </div>
      </main>
    </>
  );
}

export default PropertyDetails;