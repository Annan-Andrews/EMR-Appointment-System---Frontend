import { useState } from "react";
import { Search, User, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getPatientsApi } from "../../api/patientApi";

const ExistingPatientForm = ({ onBook, bookingLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [purpose, setPurpose] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    setSelectedPatient(null);
    try {
      const res = await getPatientsApi({ search: searchQuery });
      const patients = res.data.data?.data || [];
      setSearchResults(patients);
      if (patients.length === 0) {
        toast("No patients found. Try registering as new patient.", {
          icon: "🔍",
        });
      }
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    onBook({
      patientType: "existing",
      patientId: selectedPatient._id,
      purpose,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Search Patient
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Name, mobile, or patient ID..."
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white
                       rounded-lg text-sm font-medium transition-colors
                       disabled:opacity-50 flex items-center gap-2"
          >
            {searchLoading ? (
              <div
                className="w-4 h-4 border-2 border-white border-t-transparent
                                rounded-full animate-spin"
              />
            ) : (
              <Search size={15} />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && !selectedPatient && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <p
            className="text-xs text-gray-500 px-3 py-2 bg-gray-50
                         border-b border-gray-200"
          >
            {searchResults.length} patient{searchResults.length > 1 ? "s" : ""}{" "}
            found — click to select
          </p>
          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {searchResults.map((patient) => (
              <button
                key={patient._id}
                type="button"
                onClick={() => {
                  setSelectedPatient(patient);
                  setSearchResults([]);
                }}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-blue-50 text-left transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center
                                justify-center flex-shrink-0"
                >
                  <User size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {patient.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {patient.patientId}
                    {patient.mobile && ` · ${patient.mobile}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected patient */}
      {selectedPatient && (
        <div
          className="flex items-center gap-3 p-3 bg-green-50 border
                        border-green-200 rounded-lg"
        >
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800">
              {selectedPatient.name}
            </p>
            <p className="text-xs text-green-600">
              {selectedPatient.patientId}
              {selectedPatient.mobile && ` · ${selectedPatient.mobile}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPatient(null)}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Purpose of Visit
          <span className="text-gray-400 font-normal"> (optional)</span>
        </label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. Routine checkup, Follow up..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Book button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={bookingLoading || !selectedPatient}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                   text-white font-medium rounded-lg text-sm transition-colors
                   flex items-center justify-center gap-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {bookingLoading ? (
          <>
            <div
              className="w-4 h-4 border-2 border-white border-t-transparent
                            rounded-full animate-spin"
            />
            Booking...
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            Confirm Booking
          </>
        )}
      </button>
    </div>
  );
};

export default ExistingPatientForm;
