import React from "react";
import ContactsTable from "@/components/contacts/ContactsTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "💧 Plouf CRM Prospector",
    description: "Liste des contacts du CRM",
};

export default function ContactsPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Contacts" />
            <div className="space-y-6">
                <ContactsTable />
            </div>
        </div>
    );
}
