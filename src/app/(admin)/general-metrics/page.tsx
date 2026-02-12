import React from "react";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Métriques Générales | Plouf CRM",
    description: "Vue d'ensemble des statistiques de prospection",
};

export default function GeneralMetricsPage() {
    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    Métriques Générales
                </h2>
            </div>
            <DashboardMetrics />
            <DashboardStats />
        </div>
    );
}
