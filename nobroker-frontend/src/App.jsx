import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyInterests from "./pages/MyInterests";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import OwnerDashboard from "./pages/OwnerDashboard";
import PostProperty from "./pages/PostProperty";
import EditProperty from "./pages/EditProperty";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Buyer */}
        <Route
          path="/my-interests"
          element={<MyInterests />}
        />

        {/* Owner */}
        <Route
          path="/owner-dashboard"
          element={<OwnerDashboard />}
        />

        <Route
          path="/post-property"
          element={<PostProperty />}
        />
        <Route path="/properties/:id/edit" element={<EditProperty />} />

        <Route
          path="/conversations"
          element={<Conversations />}
        />

        {/* Shared chat */}
        <Route
          path="/chat/:conversationId"
          element={<Chat />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
