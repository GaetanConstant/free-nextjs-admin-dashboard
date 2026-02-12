"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";

interface Contact {
    id: number;
    "First Name": string;
    "Last Name": string;
    "Company Name for Emails": string;
    Email: string;
    Phone: string;
    Statut: string;
    Title: string;
    Website: string;
    "Person Linkedin Url": string;
    "Company Address": string;
    "# Employees": string;
    Industry: string;
    Commentaire: string;
    origine_contact: string;
    generated_email_subject?: string;
    generated_email_body?: string;
    [key: string]: any;
}

import { authenticatedFetch } from "@/utils/api";

export default function ProspectTinderPage() {
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchNextProspect = async () => {
        setLoading(true);
        setContact(null);
        setError("");
        try {
            const response = await authenticatedFetch("http://localhost:8000/crm/prospect-tinder/next");
            if (response.status === 200) {
                const data = await response.json();
                setContact(data);
            } else {
                setError("Aucun prospect trouvé avec email et téléphone.");
            }
        } catch (err) {
            setError("Erreur lors du chargement du prospect.");
            console.error("Error fetching prospect:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextProspect();
        document.title = "💧 Plouf CRM Prospector";
    }, []);

    const handleChange = (key: string, value: string) => {
        if (!contact) return;
        setContact({ ...contact, [key]: value });
    };

    const handleAction = async (action: "contacted" | "not_interested" | "skip") => {
        if (!contact) return;
        setIsSaving(true);

        const updates: any = { ...contact };

        if (action === "contacted") {
            updates.Statut = "Contacté";
            const today = new Date();
            updates.date_dernier_contact = today.toISOString().split("T")[0];

            // Relance automatique à J+7
            const relanceDate = new Date();
            relanceDate.setDate(today.getDate() + 7);
            updates.date_relance = relanceDate.toISOString().split("T")[0];
        } else if (action === "not_interested") {
            updates.Statut = "Pas intéressé";
        }

        try {
            await authenticatedFetch(`http://localhost:8000/crm/contact/${contact.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            fetchNextProspect();
        } catch (err) {
            console.error("Failed to update contact", err);
            alert("Erreur lors de la sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    const getPrimaryEmail = (emailStr: string) => {
        if (!emailStr) return "";
        return emailStr.split(",")[0].trim();
    }

    const getMailtoLink = () => {
        if (!contact) return "#";
        const email = getPrimaryEmail(contact.Email);
        const subject = encodeURIComponent(contact.generated_email_subject || "");
        const body = encodeURIComponent(contact.generated_email_body || "");
        return `mailto:${email}?subject=${subject}&body=${body}`;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="ProspecTinder 💘" />

            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                {loading ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-64 w-96 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ) : error ? (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={fetchNextProspect} className="bg-brand-500 text-white px-4 py-2 rounded">Réessayer</button>
                    </div>
                ) : contact ? (
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
                        {isSaving && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                            </div>
                        )}

                        {/* Header / Cover */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl shadow-md border-4 border-white dark:border-gray-800">
                                    👤
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 px-8 pb-8">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <EditableField
                                        label="Prénom"
                                        value={contact["First Name"]}
                                        onChange={(v) => handleChange("First Name", v)}
                                        className="text-xl font-bold"
                                    />
                                    <EditableField
                                        label="Nom"
                                        value={contact["Last Name"]}
                                        onChange={(v) => handleChange("Last Name", v)}
                                        className="text-xl font-bold"
                                    />
                                </div>
                                <EditableField
                                    label="Titre"
                                    value={contact.Title}
                                    onChange={(v) => handleChange("Title", v)}
                                    className="text-lg text-gray-600 dark:text-gray-300"
                                />
                                <EditableField
                                    label="Entreprise"
                                    value={contact["Company Name for Emails"]}
                                    onChange={(v) => handleChange("Company Name for Emails", v)}
                                    className="text-lg font-semibold text-brand-500"
                                />

                                <div className="mt-2 flex gap-2">
                                    <Badge color="light">{contact.Industry || "Industrie inconnue"}</Badge>
                                    <Badge color="warning">{contact.origine_contact || "Source inconnue"}</Badge>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    icon="📧"
                                    label="Email"
                                    value={contact.Email}
                                    onChange={(v) => handleChange("Email", v)}
                                    inputType="email"
                                    isLink
                                    href={getMailtoLink()}
                                />
                                <InfoItem
                                    icon="�"
                                    label="Téléphone"
                                    value={contact.Phone}
                                    onChange={(v) => handleChange("Phone", v)}
                                    inputType="tel"
                                    isLink
                                    href={`tel:${contact.Phone}`}
                                />
                                <InfoItem
                                    icon="🌐"
                                    label="Site Web"
                                    value={contact.Website}
                                    onChange={(v) => handleChange("Website", v)}
                                    isLink
                                    href={contact.Website}
                                />
                                <InfoItem
                                    icon="🔗"
                                    label="LinkedIn"
                                    value={contact["Person Linkedin Url"]}
                                    onChange={(v) => handleChange("Person Linkedin Url", v)}
                                    isLink
                                    href={contact["Person Linkedin Url"]}
                                />
                                <InfoItem
                                    icon="📍"
                                    label="Adresse"
                                    value={contact["Company Address"]}
                                    onChange={(v) => handleChange("Company Address", v)}
                                />
                                <InfoItem
                                    icon="👥"
                                    label="Effectif"
                                    value={contact["# Employees"]}
                                    onChange={(v) => handleChange("# Employees", v)}
                                />
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Commentaire</p>
                                <textarea
                                    className="w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-600 focus:ring-0 focus:border-brand-500 p-0 text-gray-700 dark:text-gray-300 italic resize-none"
                                    rows={3}
                                    placeholder="Ajouter un commentaire..."
                                    value={contact.Commentaire || ""}
                                    onChange={(e) => handleChange("Commentaire", e.target.value)}
                                />
                            </div>

                            {/* Actions Toolbar */}
                            <div className="mt-10 flex items-center justify-center gap-6">
                                <ActionButton
                                    onClick={() => handleAction("not_interested")}
                                    color="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                    icon="❌"
                                    label="Pas intéressé"
                                />

                                <ActionButton
                                    onClick={() => handleAction("skip")}
                                    color="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                    icon="⏩"
                                    label="Passer (Sauver)"
                                />

                                <ActionButton
                                    onClick={() => handleAction("contacted")}
                                    color="bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    icon="✅"
                                    label="Contacté !"
                                    isMain
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">Plus de prospects à traiter ! 🎉</div>
                )}
            </div>
        </div>
    );
}

const EditableField = ({ label, value, onChange, className }: { label: string, value: string, onChange: (v: string) => void, className?: string }) => {
    return (
        <div className="flex flex-col">
            <label className="text-xs text-gray-400 uppercase font-bold mb-1">{label}</label>
            <input
                type="text"
                className={`bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-0 px-0 py-1 w-full outline-none transition-colors ${className}`}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Ajouter ${label}...`}
            />
        </div>
    )
}

const InfoItem = ({ icon, label, value, onChange, isLink, href, inputType = "text" }: { icon: string, label: string, value: string, onChange: (v: string) => void, isLink?: boolean, href?: string, inputType?: string }) => {
    return (
        <div className="flex items-start gap-3 w-full">
            <span className="text-xl mt-2">{icon}</span>
            <div className="flex-1 w-full">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">{label}</p>
                    {isLink && href && value && (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline">
                            Ouvrir ↗
                        </a>
                    )}
                </div>
                <input
                    type={inputType}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-0 px-0 py-1 text-gray-800 dark:text-gray-200 font-medium outline-none transition-colors"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="..."
                />
            </div>
        </div>
    )
}

const ActionButton = ({ onClick, color, icon, label, isMain }: { onClick: () => void, color: string, icon: string, label: string, isMain?: boolean }) => {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
            <button className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md transition-transform transform group-hover:scale-110 ${color} ${isMain ? 'ring-4 ring-green-50 dark:ring-green-900/10' : ''}`}>
                {icon}
            </button>
            <span className={`text-sm font-medium ${isMain ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
        </div>
    )
}
