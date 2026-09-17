import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Conversations.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Conversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) throw new Error("Please login to view conversations.");
        const response = await fetch(`${API_BASE_URL}/api/chat/conversations/`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.detail || "Failed to load conversations.");
        setConversations(Array.isArray(data) ? data : data.results || []);
      } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
    };
    load();
  }, [token]);

  if (loading) return <><Navbar /><main className="conversations-page"><div className="conversations-container"><div className="conversations-loading"><span className="loading-dot" /><div><h1>Messages</h1><p>Loading conversations...</p></div></div></div></main></>;

  return <><Navbar /><main className="conversations-page"><div className="conversations-container">
    <header className="conversations-header"><div><h1>Messages</h1><p>Your conversations about properties.</p></div><Link to="/properties" className="browse-properties">Browse Properties</Link></header>
    {error && <div className="conversation-error">{error}</div>}
    {!error && conversations.length === 0 && <div className="empty-conversations"><h2>No conversations yet</h2><p>When you contact a property owner or buyer, the conversation will appear here.</p></div>}
    <div className="conversation-list">{conversations.map((conversation) => {
      const messages = conversation.messages || [];
      const latestMessage = messages.length ? messages[messages.length - 1].content : "No messages yet — start the conversation.";
      const participant = user?.id === conversation.buyer ? "Property owner" : conversation.buyer_details?.name || `Buyer #${conversation.buyer}`;
      return <article key={conversation.id} className="conversation-card"><div className="conversation-info"><div className="conversation-icon">Chat</div><div className="conversation-copy"><p className="conversation-property-label">Property conversation</p><h2>{conversation.property_details?.title || `Property #${conversation.property}`}</h2><p className="conversation-participant">{participant}</p><p className="conversation-preview">{latestMessage}</p></div></div><div className="conversation-action"><Link to={`/chat/${conversation.id}`} className="open-chat-button">Open Chat</Link><small className="conversation-time">{conversation.updated_at ? new Date(conversation.updated_at).toLocaleString("en-IN") : "Recently updated"}</small></div></article>;
    })}</div>
  </div></main></>;
}

export default Conversations;
