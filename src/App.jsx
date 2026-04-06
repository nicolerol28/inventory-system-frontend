import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Layout } from "./components/Layout";

const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Forbidden = lazy(() => import("./pages/Forbidden").then(m => ({ default: m.Forbidden })));
const Products = lazy(() => import("./pages/Products").then(m => ({ default: m.Products })));
const Suppliers = lazy(() => import("./pages/Suppliers").then(m => ({ default: m.Suppliers })));
const Warehouses = lazy(() => import("./pages/Warehouses").then(m => ({ default: m.Warehouses })));
const Movements = lazy(() => import("./pages/Movements").then(m => ({ default: m.Movements })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Users = lazy(() => import("./pages/Users").then(m => ({ default: m.Users })));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950"/>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route element={<AdminRoute />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}