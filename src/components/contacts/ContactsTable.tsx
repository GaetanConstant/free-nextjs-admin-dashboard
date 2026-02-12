"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { authenticatedFetch, API_BASE_URL } from "@/utils/api";
import ContactModal from "../modal/ContactModal";

interface Contact {
    id: number;
    "First Name": string;
    "Last Name": string;
    "Company Name for Emails": string;
    Email: string;
    Phone: string;
    Statut: string;
    Commercial: string;
    origine_contact: string;
    [key: string]: any;
}

export default function ContactsTable() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 50;

    // Filters
    const [search, setSearch] = useState("");
    const [origin, setOrigin] = useState("all");
    const [originsList, setOriginsList] = useState<string[]>([]);
    const [commercial, setCommercial] = useState("all");
    const [commercialsList, setCommercialsList] = useState<string[]>([]);

    // Sorting
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("DESC");

    // Modal
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        fetchContacts();
    }, [page, debouncedSearch, origin, commercial, sortBy, sortOrder]);

    useEffect(() => {
        // Fetch dropdow lists (origins and commercials)
        const fetchFilters = async () => {
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/crm/stats`);
                const data = await response.json();
                if (data.byOrigine) {
                    setOriginsList(Object.keys(data.byOrigine).filter(o => o !== "Non défini"));
                }
                if (data.byCommercial) {
                    setCommercialsList(Object.keys(data.byCommercial).filter(c => c !== "Non défini"));
                }
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            }
        };
        fetchFilters();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort_by: sortBy,
                sort_order: sortOrder,
            });

            if (debouncedSearch) params.append("search", debouncedSearch);
            if (origin !== "all") params.append("origin", origin);
            if (commercial !== "all") params.append("commercial", commercial);

            const response = await authenticatedFetch(`${API_BASE_URL}/crm/contacts?${params.toString()}`);
            const data = await response.json();
            setContacts(data.contacts);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(column);
            setSortOrder("ASC");
        }
    };

    const getStatusColor = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s.includes("client")) return "success";
        if (s.includes("chaud") || s.includes("rdv")) return "warning";
        if (s.includes("contacter")) return "info";
        if (s.includes("pas intéressé") || s.includes("perdu") || s.includes("ne pas")) return "error";
        return "light";
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr || dateStr === "NaT" || dateStr === "None") return "-";
        return dateStr.split("T")[0];
    };

    const handleRowClick = (contact: Contact) => {
        const cleanContact = { ...contact };
        // Ensure editable date format (YYYY-MM-DD) for modal
        if (cleanContact.date_relance && cleanContact.date_relance.includes("T")) {
            cleanContact.date_relance = cleanContact.date_relance.split("T")[0];
        }
        if (cleanContact.date_dernier_contact && cleanContact.date_dernier_contact.includes("T")) {
            cleanContact.date_dernier_contact = cleanContact.date_dernier_contact.split("T")[0];
        }
        if (cleanContact.date_relance === "NaT") cleanContact.date_relance = "";
        if (cleanContact.date_dernier_contact === "NaT") cleanContact.date_dernier_contact = "";

        setSelectedContact(cleanContact);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Rechercher (Nom, Entreprise, Email)..."
                        className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 outline-none"
                        value={origin}
                        onChange={(e) => { setOrigin(e.target.value); setPage(1); }}
                    >
                        <option value="all">Toutes origines</option>
                        {originsList.map((o) => (
                            <option key={o} value={o}>{o}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 outline-none"
                        value={commercial}
                        onChange={(e) => { setCommercial(e.target.value); setPage(1); }}
                    >
                        <option value="all">Tous commerciaux</option>
                        {commercialsList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Contacts <span className="text-sm font-normal text-gray-500">({total})</span>
                    </h3>
                    <div className="flex gap-2 items-center">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Précédent
                        </button>
                        <span className="text-sm">Page {page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <SortableHeader label="Nom" column="Last Name" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Entreprise" column="Company Name for Emails" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Email" column="Email" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Téléphone" column="Phone" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Statut" column="Statut" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Commercial" column="Commercial" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Relance" column="date_relance" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Dernier Contact" column="date_dernier_contact" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader label="Origine" column="origine_contact" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableRow>
                                        <TableCell className="px-5 py-8 text-center" colSpan={9}>Chargement...</TableCell>
                                    </TableRow>
                                ) : contacts.length === 0 ? (
                                    <TableRow>
                                        <TableCell className="px-5 py-8 text-center" colSpan={9}>Aucun contact trouvé.</TableCell>
                                    </TableRow>
                                ) : (
                                    contacts.map((contact) => (
                                        <TableRow key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => handleRowClick(contact)}>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-medium">
                                                {contact["First Name"]} {contact["Last Name"]}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {contact["Company Name for Emails"]}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {(contact.Email || "").split(",")[0].trim()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {contact.Phone}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <Badge size="sm" color={getStatusColor(contact.Statut)}>
                                                    {contact.Statut || "Non défini"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {contact.Commercial}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {formatDate(contact.date_relance)}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {formatDate(contact.date_dernier_contact)}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {contact.origine_contact}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <ContactModal
                contact={selectedContact}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchContacts}
            />
        </div>
    );
}

const SortableHeader = ({ label, column, currentSort, sortOrder, onSort }: { label: string, column: string, currentSort: string, sortOrder: string, onSort: (col: string) => void }) => {
    return (
        <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none group"
            onClick={() => onSort(column)}
        >
            <div className="flex items-center gap-1">
                {label}
                <span className="text-gray-400 text-[10px] flex flex-col">
                    <span className={currentSort === column && sortOrder === 'ASC' ? 'text-brand-500' : ''}>▲</span>
                    <span className={currentSort === column && sortOrder === 'DESC' ? 'text-brand-500' : ''}>▼</span>
                </span>
            </div>
        </TableCell>
    );
};
