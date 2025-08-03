import React, { useState } from "react";
import Papa from "papaparse";

const VolunteerReportDownload = () => {
    const [csvData, setCsvData] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);

    const [statusFilter, setStatusFilter] = useState(""); 
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [uniqueEmails, setUniqueEmails] = useState(0);
    const [uniqueEvents, setUniqueEvents] = useState(0);


    
    const formatDate = (datetime) => {
        if (!datetime) return "N/A";
        return datetime.split("T")[0] || "N/A";
    };

    const getFirstAndLastName = (fullName) => {
        if (!fullName) return { first_name: "N/A", last_name: "N/A" };
        const parts = fullName.trim().split(" ");
        return {
            first_name: parts[0] || "N/A",
            last_name: parts.slice(1).join(" ") || "N/A",
        };
    };

    
    const applyFilters = (data) => {
        return data.filter((row) => {
            
            if (statusFilter && row.status?.toLowerCase() !== statusFilter.toLowerCase()) {
                return false;
            }

            
            if (startDateFilter && endDateFilter) {
                const startDate = new Date(startDateFilter);
                const endDate = new Date(endDateFilter);
                const rowStartDate = row.start_datetime ? new Date(row.start_datetime) : null;

                if (!rowStartDate) return false;

                
                if (rowStartDate < startDate || rowStartDate > endDate) return false;
            }

            return true;
        });
    };

    const processCsvData = (data) => {
        
        const filteredData = applyFilters(data);

        
        const sortedData = [...filteredData].sort((a, b) => {
            const aEmpty = !a.event_name || a.event_name.trim() === "";
            const bEmpty = !b.event_name || b.event_name.trim() === "";
            if (aEmpty && !bEmpty) return 1;
            if (!aEmpty && bEmpty) return -1;
            return 0;
        });

        
        const grouped = {};
        sortedData.forEach((row) => {
            const email = row.email ? row.email.trim() : "N/A";

            const { first_name, last_name } = getFirstAndLastName(row.full_name);
            row.first_name = first_name;
            row.last_name = last_name;

            if (!grouped[email]) grouped[email] = [];
            grouped[email].push(row);
        });

        
        const cleanField = (field) => {
            if (!field) return "N/A";
            const trimmed = field.trim();
            return trimmed === "" ? "N/A" : trimmed;
        };

        
        const result = [];
        Object.entries(grouped).forEach(([email, rows]) => {
            rows.forEach((row, idx) => {
                const emptyEvent = !row.event_name || row.event_name.trim() === "";

                const first_name = cleanField(row.first_name);
                const last_name = cleanField(row.last_name);
                const event_name = emptyEvent ? "N/A" : cleanField(row.event_name);
                const start_datetime = emptyEvent ? "N/A" : formatDate(row.start_datetime);
                const end_datetime = emptyEvent ? "N/A" : formatDate(row.end_datetime);
                const status = emptyEvent ? "N/A" : cleanField(row.status);

                if (idx === 0) {
                    result.push({
                        email,
                        first_name,
                        last_name,
                        event_name,
                        start_datetime,
                        end_datetime,
                        status,
                    });
                } else {
                    result.push({
                        email: "->",
                        first_name: "",
                        last_name: "",
                        event_name,
                        start_datetime,
                        end_datetime,
                        status,
                    });
                }
            });
        });

        return result;
    };

    
    const loadCsvData = async () => {
        const res = await fetch(
            "http://localhost:8080/api/volunteerHistoryReport/volunteer-participation/csv"
        );
        const csvText = await res.text();
        const parsed = Papa.parse(csvText, { header: true });
        const processedData = processCsvData(parsed.data);
        setCsvData(processedData);
        setPdfUrl(null);

        setTotalRows(processedData.length);

        
        const emailsSet = new Set(processedData.map(row => row.email).filter(e => e !== "->"));
        setUniqueEmails(emailsSet.size);

        const eventsSet = new Set(
            processedData
                .map(row => row.event_name)
                .filter(event => event && event !== "N/A")
        );
        setUniqueEvents(eventsSet.size);
    };


    
    const handleDownload = (format) => {
        let url = `http://localhost:8080/api/volunteerHistoryReport/volunteer-participation/${format}`;

        
        const params = new URLSearchParams();
        if (statusFilter) params.append("status", statusFilter);
        if (startDateFilter) params.append("startDate", startDateFilter);
        if (endDateFilter) params.append("endDate", endDateFilter);
        if ([...params].length) url += `?${params.toString()}`;

        const link = document.createElement("a");
        link.href = url;
        link.download = `volunteer_report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    
    const showPdfPreview = () => {
        let url = `http://localhost:8080/api/volunteerHistoryReport/volunteer-participation/pdf`;
        const params = new URLSearchParams();
        if (statusFilter) params.append("status", statusFilter);
        if (startDateFilter) params.append("startDate", startDateFilter);
        if (endDateFilter) params.append("endDate", endDateFilter);
        if ([...params].length) url += `?${params.toString()}`;
        setPdfUrl(url);
        setCsvData([]);
    };

    
    const closePreview = () => {
        setCsvData([]);
        setPdfUrl(null);
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Volunteer Participation Report</h2>
            <p>select a filter, then click on CSV preview or download CSV/PDF directly</p>

            {/* Filters */}
            <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                    <label>Status: </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: "0.25rem", minWidth: "150px" }}
                    >
                        <option value="">All</option>
                        <option value="assigned">Assigned</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div>
                    <label>Start Date: </label>
                    <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                    />
                </div>

                <div>
                    <label>End Date: </label>
                    <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <button onClick={loadCsvData} style={buttonStyle}>
                    Preview CSV Data
                </button>
                <button onClick={() => handleDownload("csv")} style={buttonStyle}>
                    Download CSV
                </button>
                <button onClick={showPdfPreview} style={buttonStyle}>
                    Download PDF
                </button>
                {(csvData.length > 0 || pdfUrl) && (
                    <button onClick={closePreview} style={closeButtonStyle}>
                        Close Preview
                    </button>
                )}
            </div>

            {/* CSV Table Display */}
            {csvData.length > 0 && (
                <>
                    <div style={{ marginBottom: "1rem" }}>
                        <strong>Stats:</strong>
                        <p>Total Rows: {totalRows}</p>
                        <p>Unique Users: {uniqueEmails}</p>
                        <p>Unique Events: {uniqueEvents}</p>
                    </div>

                <table
                    border="1"
                    cellPadding="5"
                    style={{ borderCollapse: "collapse", width: "100%" }}
                >
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Event Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {csvData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.email}</td>

                                <td>{row.event_name}</td>
                                <td>{row.start_datetime}</td>
                                <td>{row.end_datetime}</td>
                                <td>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </>
            )}

            {/* PDF Preview */}
            {pdfUrl && (
                <iframe
                    src={pdfUrl}
                    width="100%"
                    height="600px"
                    title="Volunteer Report PDF"
                    style={{ marginTop: "1rem", border: "1px solid #ccc" }}
                />
            )}
        </div>
    );
};

const buttonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
};

const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
};

export default VolunteerReportDownload;
