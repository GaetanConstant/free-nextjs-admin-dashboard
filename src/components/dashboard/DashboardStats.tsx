"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import { authenticatedFetch } from "@/utils/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type StatsData = {
    total: number;
    byStatus: Record<string, number>;
    byCommercial: Record<string, number>;
    byIndustry: Record<string, number>;
    byOrigine: Record<string, number>;
};

export const DashboardStats = () => {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authenticatedFetch("http://localhost:8000/crm/stats");
                const json = await response.json();
                setData(json);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Chargement des statistiques...</div>;
    if (!data) return <div>Erreur de chargement</div>;

    // Pie Chart Config
    const statusSeries = Object.values(data.byStatus);
    const statusLabels = Object.keys(data.byStatus);
    const statusOptions: ApexOptions = {
        chart: { type: "donut" },
        labels: statusLabels,
        legend: { position: 'bottom' },
        colors: ["#3C50E0", "#80CAEE", "#6577F3", "#0FADCF"]
    };

    // Bar Chart Config (Top 10 Industries)
    const sortedInd = Object.entries(data.byIndustry).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const indSeries = [{ name: "Prospects", data: sortedInd.map(i => i[1]) }];
    const indOptions: ApexOptions = {
        chart: { type: "bar" },
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        xaxis: { categories: sortedInd.map(i => i[0]) },
        colors: ["#3C50E0"]
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 md:gap-6 mt-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Répartition par Statut</h3>
                <ReactApexChart options={statusOptions} series={statusSeries} type="donut" height={350} />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Top 10 Industries</h3>
                <ReactApexChart options={indOptions} series={indSeries} type="bar" height={350} />
            </div>
        </div>
    );
};
