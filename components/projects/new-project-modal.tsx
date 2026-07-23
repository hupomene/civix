"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, X } from "lucide-react";
import {
  TEXAS_COUNTIES,
  formatTexasCountyLocation,
} from "@/lib/constants/texas-counties";
import { US_STATES, formatStateLabel } from "@/lib/constants/us-states";

type NewProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onProjectCreated: (project: {
    id: string;
    name: string;
    location: string;
    type: string;
    status: string;
    risk: "Low" | "Medium" | "High";
    documents: number;
    openItems: number;
    createdAt: string;
    jurisdictionId: string | null;
    jurisdictionName: string | null;
    projectState: string | null;
    projectCounty: string | null;
    projectCity: string | null;
  }) => void;
};

type CreateProjectResponse = {
  ok: boolean;
  project?: {
    id: string;
    name: string;
    location: string;
    type: string;
    status: string;
    risk: "Low" | "Medium" | "High";
    documents: number;
    openItems: number;
    createdAt: string;
    jurisdictionId: string | null;
    jurisdictionName: string | null;
    projectState: string | null;
    projectCounty: string | null;
    projectCity: string | null;
  };
  error?: string;
};

type JurisdictionListItem = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

type JurisdictionsResponse = {
  ok: boolean;
  jurisdictions?: JurisdictionListItem[];
  error?: string;
};

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() ?? "";
}

function normalizeCounty(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.toLowerCase().endsWith("county")
    ? trimmed
    : `${trimmed} County`;
}

function findMatchingJurisdiction(
  projectLocation: string,
  jurisdictions: JurisdictionListItem[],
  projectState?: string | null,
  projectCounty?: string | null,
  projectCity?: string | null
) {
  const normalizedLocation = normalizeText(projectLocation);
  const normalizedState = normalizeText(projectState);
  const normalizedCounty = normalizeText(normalizeCounty(projectCounty));
  const normalizedCity = normalizeText(projectCity);

  if (normalizedState && normalizedCounty && normalizedCity) {
    const cityMatch = jurisdictions.find(
      (jurisdiction) =>
        normalizeText(jurisdiction.state) === normalizedState &&
        normalizeText(jurisdiction.county) === normalizedCounty &&
        normalizeText(jurisdiction.city) === normalizedCity &&
        normalizeText(jurisdiction.jurisdiction_type) === "city"
    );

    if (cityMatch) {
      return cityMatch;
    }
  }

  if (normalizedState && normalizedCounty) {
    const countyMatch = jurisdictions.find(
      (jurisdiction) =>
        normalizeText(jurisdiction.state) === normalizedState &&
        normalizeText(jurisdiction.county) === normalizedCounty &&
        normalizeText(jurisdiction.jurisdiction_type) === "county"
    );

    if (countyMatch) {
      return countyMatch;
    }
  }

  if (!normalizedLocation) {
    return null;
  }

  return (
    jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.city &&
        normalizedLocation.includes(normalizeText(jurisdiction.city)) &&
        normalizeText(jurisdiction.jurisdiction_type) === "city"
    ) ??
    jurisdictions.find((jurisdiction) =>
      normalizedLocation.includes(normalizeText(jurisdiction.name))
    ) ??
    jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.county &&
        normalizedLocation.includes(normalizeText(jurisdiction.county))
    ) ??
    null
  );
}

export function NewProjectModal({
  open,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [selectedState, setSelectedState] = useState("TX");
  const [stateSearch, setStateSearch] = useState("Texas (TX)");
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [countyDropdownOpen, setCountyDropdownOpen] = useState(false);
  const [countySearch, setCountySearch] = useState("");
  const [projectType, setProjectType] = useState("Commercial Renovation");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jurisdictions, setJurisdictions] = useState<JurisdictionListItem[]>([]);
  const [matchedJurisdiction, setMatchedJurisdiction] =
    useState<JurisdictionListItem | null>(null);

  useEffect(() => {
    async function loadJurisdictions() {
      try {
        const response = await fetch("/api/jurisdictions");
        const data = (await response.json()) as JurisdictionsResponse;

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "Failed to load jurisdictions.");
        }

        setJurisdictions(data.jurisdictions ?? []);
      } catch (error) {
        console.error("Failed to load jurisdictions:", error);
        setJurisdictions([]);
      }
    }

    if (open) {
      loadJurisdictions();
    }
  }, [open]);

  useEffect(() => {
    const matched = findMatchingJurisdiction(
      location,
      jurisdictions,
      selectedState,
      selectedCounty,
      selectedCity
    );

    setMatchedJurisdiction(matched);
  }, [location, jurisdictions, selectedState, selectedCounty, selectedCity]); 
  
  const filteredStates = US_STATES.filter((state) => {
    const search = stateSearch.toLowerCase().trim();

    return (
      state.name.toLowerCase().includes(search) ||
      state.abbreviation.toLowerCase().includes(search) ||
      formatStateLabel(state).toLowerCase().includes(search)
    );
  }).slice(0, 12);

  const filteredCounties = TEXAS_COUNTIES.filter((county) =>
    county.toLowerCase().includes(countySearch.toLowerCase().trim())
  ).slice(0, 12);

  function handleStateChange(stateAbbreviation: string) {
    const state = US_STATES.find(
      (item) => item.abbreviation === stateAbbreviation
    );

    if (!state) return;

    setSelectedState(state.abbreviation);
    setStateSearch(formatStateLabel(state));
    setStateDropdownOpen(false);

    setSelectedCounty("");
    setSelectedCity("");
    setCountySearch("");
    setCountyDropdownOpen(false);
    setLocation("");
    setMatchedJurisdiction(null);
  }

  function handleCountyChange(county: string) {
    if (selectedState !== "TX") {
      return;
    }

    const city = county === "Denton" ? "Lake Dallas" : "";
    const nextLocation = city
      ? `${city}, ${county} County, TX`
      : county
        ? formatTexasCountyLocation(county)
        : "";

    setSelectedCounty(county);
    setSelectedCity(city);
    setCountySearch(county ? `${county} County` : "");
    setCountyDropdownOpen(false);
    setLocation(nextLocation);
  }

  const canCreateProject =
    name.trim().length > 0 &&
    selectedState === "TX" &&
    selectedCounty.trim().length > 0 &&
    !isCreating;

  if (!open) return null;

  async function handleCreateProject() {
    try {
      setIsCreating(true);
      setError(null);

      if (!name.trim()) {
        setError("Project name is required.");
        return;
      }

      if (selectedState !== "TX") {
        setError("Currently, project creation is available for Texas counties only.");
        return;
      }

      if (!selectedCounty.trim()) {
        setError("Please select a Texas county for this project.");
        return;
      }

      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          projectType,
          jurisdictionId: matchedJurisdiction?.id ?? null,
          projectState: selectedState,
          projectCounty: selectedCounty,
          projectCity: selectedCity || null,
        }),
      });

      const data = (await response.json()) as CreateProjectResponse;

      if (!response.ok || !data.ok || !data.project) {
        throw new Error(data.error ?? "Failed to create project.");
      }

      onProjectCreated(data.project);

      setName("");
      setLocation("");

      setSelectedState("TX");
      setStateSearch("Texas (TX)");
      setStateDropdownOpen(false);

      setSelectedCounty("");
      setSelectedCity("");
      setCountySearch("");
      setCountyDropdownOpen(false);

      setProjectType("Commercial Renovation");
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create project."
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Create New Project
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a new construction workspace for permit review.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Project Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Dallas Retail Buildout"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <label className="text-sm font-semibold text-slate-700">
                State
              </label>

              <input
                value={stateSearch}
                onChange={(event) => {
                  const value = event.target.value;
                  setStateSearch(value);
                  setStateDropdownOpen(true);

                  const exactState = US_STATES.find(
                    (state) =>
                      state.name.toLowerCase() === value.toLowerCase().trim() ||
                      state.abbreviation.toLowerCase() === value.toLowerCase().trim() ||
                      formatStateLabel(state).toLowerCase() === value.toLowerCase().trim()
                  );

                  if (exactState) {
                    handleStateChange(exactState.abbreviation);
                  } else {
                    setSelectedState("");
                    setSelectedCounty("");
                    setCountySearch("");
                    setLocation("");
                    setMatchedJurisdiction(null);
                  }
                }}
                onFocus={() => setStateDropdownOpen(true)}
                placeholder="Search state, e.g. Texas"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />

              {stateDropdownOpen && (
                <div className="absolute z-40 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {filteredStates.length > 0 ? (
                    filteredStates.map((state) => (
                      <button
                        key={state.abbreviation}
                        type="button"
                        onClick={() => handleStateChange(state.abbreviation)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-indigo-50 ${
                          selectedState === state.abbreviation
                            ? "bg-indigo-50 font-semibold text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {formatStateLabel(state)}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      No state found.
                    </p>
                  )}
                </div>
              )}

              <p className="mt-1 text-xs text-slate-400">
                Select the state where the project is located.
              </p>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-slate-700">
                County
              </label>

              <input
                value={countySearch}
                disabled={selectedState !== "TX"}
                onChange={(event) => {
                  const value = event.target.value;
                  setCountySearch(value);
                  setCountyDropdownOpen(true);

                  if (selectedState !== "TX") {
                    setSelectedCounty("");
                    setLocation("");
                    return;
                  }

                  const normalizedValue = value
                    .toLowerCase()
                    .replace(/\s+county$/, "")
                    .trim();

                  const exactCounty = TEXAS_COUNTIES.find(
                    (county) => county.toLowerCase() === normalizedValue
                  );

                  if (exactCounty) {
                    setSelectedCounty(exactCounty);
                    setLocation(formatTexasCountyLocation(exactCounty));
                  } else {
                    setSelectedCounty("");
                    setLocation("");
                  }
                }}
                onFocus={() => {
                  if (selectedState === "TX") {
                    setCountyDropdownOpen(true);
                  }
                }}
                placeholder={
                  selectedState === "TX"
                    ? "Search Texas county, e.g. Collin"
                    : "County list for this state will be added later"
                }
                className={`mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${
                  selectedState !== "TX" ? "bg-slate-50 text-slate-400" : ""
                }`}
              />

              {countyDropdownOpen && selectedState === "TX" && (
                <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {filteredCounties.length > 0 ? (
                    filteredCounties.map((county) => (
                      <button
                        key={county}
                        type="button"
                        onClick={() => handleCountyChange(county)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-indigo-50 ${
                          selectedCounty === county
                            ? "bg-indigo-50 font-semibold text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {county} County
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      No Texas county found.
                    </p>
                  )}
                </div>
              )}

              <p className="mt-1 text-xs text-slate-400">
                {selectedState === "TX"
                  ? selectedCounty === "Denton"
                    ? "Lake Dallas city jurisdiction will be used for this Denton County test project."
                    : "Location will be saved as county/state."
                  : "County data for this state will be added later. Texas counties are currently supported for project creation."}
              </p>
            </div>
          </div>

          {selectedCity && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">City Jurisdiction</p>
              <p className="mt-1">
                {selectedCity}, {selectedCounty} County, TX will be used as the
                primary jurisdiction for this project.
              </p>
            </div>
          )}

          {location.trim().length > 0 && (
            <div
              className={`rounded-2xl border p-4 text-sm ${
                matchedJurisdiction
                  ? "border-indigo-100 bg-indigo-50 text-indigo-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <p className="font-semibold">
                {matchedJurisdiction
                  ? "Matched Jurisdiction Preview"
                  : "No Jurisdiction Pack Linked Yet"}
              </p>

              {matchedJurisdiction ? (
                <p className="mt-1">{matchedJurisdiction.name}</p>
              ) : (
                <div className="mt-1 space-y-1">
                  <p>
                    CIVIX will still create the project and analyze uploaded permit
                    package documents.
                  </p>
                  <p>
                    County/city code evidence will not be included until a jurisdiction
                    pack for {location} is uploaded.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option>Commercial Renovation</option>
              <option>Tenant Improvement</option>
              <option>Ground-Up Construction</option>
              <option>Mixed-Use Development</option>
              <option>Residential Project</option>
              <option>Industrial / Warehouse</option>
              <option>Construction Project</option>
            </select>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreateProject}
            disabled={!canCreateProject}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}