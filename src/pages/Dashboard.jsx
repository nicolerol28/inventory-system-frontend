import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getAllProducts } from "../api/products";
import { getSuppliers } from "../api/suppliers";
import { getWarehouses, getActiveWarehouses } from "../api/warehouses";
import { getStockByWarehouse } from "../api/inventory";

function StatCard({ label, value, isLoading }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-300">
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{label}</p>
      {isLoading ? (
        <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
      ) : (
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{value ?? "—"}</p>
      )}
    </div>
  );
}

function StockBadge({ belowMinimum }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
      belowMinimum
        ? "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
        : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
    }`}>
      {belowMinimum ? "BAJO MÍNIMO" : "OK"}
    </span>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const [inputPage, setInputPage] = useState("");

  function handleJump() {
    const num = parseInt(inputPage) - 1;
    if (!isNaN(num) && num >= 0 && num < totalPages) {
      onPageChange(num);
      setInputPage("");
    }
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-400 dark:text-gray-600">
        Página {page + 1} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            placeholder="Ir a..."
            className="w-16 px-2 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleJump}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Ir
          </button>
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 text-xs shadow-sm">
        <p className="text-gray-900 dark:text-white font-medium">{payload[0].payload.name}</p>
        <p className="text-blue-600 dark:text-blue-400">Cantidad: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [stockPage, setStockPage] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const PAGE_SIZE = 5;

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-count"],
    queryFn: () => getAllProducts(0, 1),
  });

  const { data: suppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers-count"],
    queryFn: () => getSuppliers(0, 1),
  });

  const { data: warehousesPage, isLoading: loadingWarehouses } = useQuery({
    queryKey: ["warehouses-count"],
    queryFn: () => getWarehouses(0, 1),
  });

  const { data: activeWarehouses, isLoading: loadingActive } = useQuery({
    queryKey: ["warehouses-active"],
    queryFn: getActiveWarehouses,
  });

  const activeWarehouseId = selectedWarehouseId ?? activeWarehouses?.[0]?.id;

  const { data: stock, isLoading: loadingStock } = useQuery({
    queryKey: ["stock-warehouse", activeWarehouseId, stockPage, urlSearch, sortOrder],
    queryFn: () => getStockByWarehouse(activeWarehouseId, stockPage, PAGE_SIZE, urlSearch, sortOrder),
    enabled: !!activeWarehouseId,
  });

  const { data: stockChart } = useQuery({
    queryKey: ["stock-warehouse-chart", activeWarehouseId, sortOrder],
    queryFn: () => getStockByWarehouse(activeWarehouseId, 0, 10, "", sortOrder),
    enabled: !!activeWarehouseId,
  });

  const chartData = stockChart?.content?.map((s) => ({
    name: s.productName ?? `#${s.productId}`,
    cantidad: parseFloat(s.quantity),
    belowMinimum: s.belowMinimum,
  })) ?? [];

  function handleWarehouseChange(id) {
    setSelectedWarehouseId(id);
    setStockPage(0);
  }

  function handleSortToggle() {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setStockPage(0);
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total productos" value={products?.totalElements} isLoading={loadingProducts}/>
        <StatCard label="Proveedores" value={suppliers?.totalElements} isLoading={loadingSuppliers}/>
        <StatCard label="Almacenes" value={warehousesPage?.totalElements} isLoading={loadingWarehouses}/>
      </div>

      {/* Stock por almacén */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Stock por almacén</h2>
            {urlSearch && (
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                Filtro: "{urlSearch}"
              </span>
            )}
          </div>
          {loadingActive ? (
            <div className="h-8 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"/>
          ) : (
            <div className="flex items-center gap-2">
              {activeWarehouses?.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWarehouseChange(w.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    activeWarehouseId === w.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 dark:border-gray-800">
          <button
            onClick={handleSortToggle}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Cantidad {sortOrder === "asc" ? "↑ Menor a mayor" : "↓ Mayor a menor"}
          </button>
        </div>

        {/* Tabla */}
        {loadingStock ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
            ))}
          </div>
        ) : stock?.content?.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 dark:text-gray-600 text-center">
            No se encontraron productos{urlSearch ? ` para "${urlSearch}"` : ""}.
          </p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Producto</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Cantidad</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Mínimo</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stock?.content?.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{s.productName ?? `Producto #${s.productId}`}</td>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{s.quantity}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-500">{s.minQuantity}</td>
                    <td className="px-6 py-3"><StockBadge belowMinimum={s.belowMinimum}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={stockPage} totalPages={stock?.totalPages ?? 0} onPageChange={setStockPage}/>
          </>
        )}
      </div>

      {/* Gráfica */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-300">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">
            Top 10 productos por cantidad
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(37,99,235,0.05)" }}/>
              <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} maxBarSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.belowMinimum ? "#FCA5A5" : "#2563EB"}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-4">
            Barras rojas indican stock por debajo del mínimo requerido.
          </p>
        </div>
      )}
    </div>
  );
}