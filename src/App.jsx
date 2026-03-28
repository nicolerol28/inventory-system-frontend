import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Forbidden } from "./pages/Forbidden";

export default function App() {
  return (
    <Routes>
      {/* Publica */}
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Protegidas — requieren autenticacion */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Solo ADMIN */}
        <Route element={<AdminRoute />}>
          <Route path="/users" element={<div>Usuarios</div>} />
        </Route>
      </Route>

      {/* Ruta raiz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Cualquier ruta desconocida */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
