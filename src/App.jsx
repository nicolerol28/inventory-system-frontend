import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Forbidden } from "./pages/Forbidden";
import { Products } from "./pages/Products";
import { Suppliers } from "./pages/Suppliers";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/movements" element={<div className="text-gray-500 dark:text-gray-400">Movimientos — próximamente</div>} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/warehouses" element={<div className="text-gray-500 dark:text-gray-400">Almacenes — próximamente</div>} />
          <Route element={<AdminRoute />}>
            <Route path="/settings" element={<div className="text-gray-500 dark:text-gray-400">Configuración — próximamente</div>} />
            <Route path="/users" element={<div className="text-gray-500 dark:text-gray-400">Usuarios — próximamente</div>} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}