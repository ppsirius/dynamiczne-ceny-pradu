import { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format } from "date-fns";
import { DatePicker } from "./components/DatePicker";
import { PeriodPicker, type Period } from "./components/PeriodPicker";
import type { DataStructure, DataPoint } from "./types/data";
import { LineChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1h");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.raporty.pse.pl/api/rce-pln?$filter=business_date%20eq%20'${selectedDate}'`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data: DataStructure = await response.json();

        setData(data.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const processedData = useMemo(() => {
    // Validate and filter data
    const validData = data.filter((point) => {
      const isValid = point.udtczas && typeof point.rce_pln === "number";
      if (!isValid) {
        console.log("Invalid data point:", point);
      }
      return isValid;
    });

    // For 15min period, return sorted data
    if (selectedPeriod === "15min") {
      return [...validData].sort((a, b) => {
        const timeA = a.udtczas.split(":").map(Number);
        const timeB = b.udtczas.split(":").map(Number);
        if (timeA.length !== 2 || timeB.length !== 2) return 0;
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
    }

    // Group data by hour for 1h periods
    const hourlyGroups: { [key: string]: number[] } = {};

    validData.forEach((point) => {
      const timeParts = point.udtczas.split(":");
      // Handle both HH:mm and HH:mm:ss formats
      if (timeParts.length < 2) return;

      const hour = timeParts[0].padStart(2, "0");
      const hourKey = `${selectedDate} ${hour}:00`;

      if (!hourlyGroups[hourKey]) {
        hourlyGroups[hourKey] = [];
      }
      hourlyGroups[hourKey].push(point.rce_pln);
    });

    // Calculate averages and sort by hour
    return Object.entries(hourlyGroups)
      .sort(([a], [b]) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([hourKey, prices]) => {
        const avgPrice =
          prices.reduce((sum, price) => sum + price, 0) / prices.length;
        return {
          udtczas_oreb: hourKey,
          rce_pln: Number(avgPrice.toFixed(2)),
          business_date: selectedDate,
          doba: selectedDate,
          udtczas: hourKey,
          source_datetime: new Date().toISOString(),
        };
      });
  }, [data, selectedPeriod, selectedDate]);

  const chartData = {
    labels: processedData.map((d) => {
      // Extract only the time part for display
      const parts = d.udtczas_oreb.split(" ");
      const timePart = parts.length > 1 ? parts[1] : d.udtczas_oreb;
      // For 1h period, show only hour
      if (selectedPeriod === "1h") {
        const cleanDateString = d.udtczas_oreb.slice(-16);

        const date = new Date(cleanDateString);

        const hour = format(date, "HH:mm");
        return hour;
      }
      return timePart;
    }),
    datasets: [
      {
        label: "PLN",
        data: processedData.map((d) => d.rce_pln),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#e5e7eb",
        },
      },
      title: {
        display: true,
        text: `Rynkowe ceny dynamiczne PSE (${
          selectedPeriod === "15min" ? "15 minut" : "1 godzina"
        })`,
        color: "#e5e7eb",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { parsed: { y: number } }) {
            return `Cena: ${context.parsed.y.toFixed(2)} PLN`;
          },
          title: function (tooltipItems: { dataIndex: number }[]) {
            if (tooltipItems.length === 0) return "";
            const index = tooltipItems[0].dataIndex;
            return `Czas: ${processedData[index]?.udtczas_oreb || ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
        ticks: {
          color: "#e5e7eb",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        type: "linear" as const,
        ticks: {
          color: "#e5e7eb",
          callback: function (value: string | number) {
            return `${Number(value).toFixed(2)} PLN`;
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="min-h-screen dark bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LineChart className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              Rynkowe ceny dynamiczne PSE
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <PeriodPicker
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          {loading && (
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="h-[400px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
