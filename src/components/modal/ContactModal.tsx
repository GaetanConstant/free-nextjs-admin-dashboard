"use client";
import React, { useState, useEffect } from "react";
import { authenticatedFetch } from "@/utils/api";

interface Contact {
    id: number;
    [key: string]: any;
}

interface ContactModalProps {
    contact: Contact | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ContactModal({ contact, isOpen, onClose, onUpdate }: ContactModalProps) {
    const [formData, setFormData] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contact) {
            const emails = (contact.Email || "").split(",").map((e: string) => e.trim());
            const primaryEmail = emails[0] || "";
            const secondaryEmail = emails.slice(1).join(", ");
            setFormData({ ...contact, Email: primaryEmail, "Email Secondaire": secondaryEmail });
        } else {
            setFormData(null);
        }
    }, [contact]);

    if (!isOpen || !formData) return null;

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => prev ? { ...prev, [key]: value } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setLoading(true);

        // Reconstruct Email field
        const primary = formData.Email || "";
        const secondary = formData["Email Secondaire"] || "";
        const combinedEmail = [primary, secondary].filter(Boolean).join(", ");

        const { "Email Secondaire": _, ...rest } = formData;
        const payload = { ...rest, Email: combinedEmail };

        try {
            const response = await authenticatedFetch(`http://localhost:8000/crm/contact/${formData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.detail || errorData.message || "Erreur inconnue";
                alert(`Erreur lors de la mise à jour: ${message}`);
                console.error("Update failed", response.status, errorData);
                return; // Keep modal open
            }

            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating contact", error);
            alert("Erreur technique ou réseau lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    // List of fields to edit (ordered)
    const fields = [
        { label: "Prénom", key: "First Name" },
        { label: "Nom", key: "Last Name" },
        { label: "Email", key: "Email" },
        { label: "Email Secondaire", key: "Email Secondaire" },
        { label: "Téléphone", key: "Phone" },
        { label: "Entreprise", key: "Company Name for Emails" },
        { label: "Titre", key: "Title" },
        { label: "Site Web", key: "Website" },
        { label: "LinkedIn", key: "Person Linkedin Url" },
        { label: "Adresse", key: "Company Address" },
        { label: "Effectif", key: "# Employees" },
        { label: "Industrie", key: "Industry" },
        { label: "Commercial", key: "Commercial" },
        { label: "Statut", key: "Statut" },
        { label: "Origine", key: "origine_contact" },
        { label: "Dernier Contact", key: "date_dernier_contact", type: "date" },
        { label: "Prochaine Relance", key: "date_relance", type: "date" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Détail Contact
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field) => (
                        <div key={field.key} className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                {field.label}
                            </label>
                            <input
                                type={field.type || "text"}
                                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={formData[field.key] || ""}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                            Commentaire
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={formData["Commentaire"] || ""}
                            onChange={(e) => handleChange("Commentaire", e.target.value)}
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
