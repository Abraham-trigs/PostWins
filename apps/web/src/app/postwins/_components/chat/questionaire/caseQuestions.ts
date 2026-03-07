// Purpose: Defines the conversational intake flow for creating a case.

export type CaseField =
  | "beneficiaryId" // Changed from beneficiaryName to match database intent
  | "issue"
  | "location"
  | "reason"
  | "category";

export type CaseQuestion = {
  id: string;
  field: CaseField;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "select" | "beneficiary_select";
  options?: string[];
};

export const caseQuestions: CaseQuestion[] = [
  {
    id: "beneficiaryId",
    field: "beneficiaryId",
    label: "Who is this case about?",
    type: "beneficiary_select",
    placeholder: "Search or type full name...",
    required: true,
  },
  {
    id: "issue",
    field: "issue",
    label: "What is the main issue?",
    placeholder: "Describe the problem",
    required: true,
  },
  {
    id: "location",
    field: "location",
    label: "Where did it happen?",
    placeholder: "City / District / Area",
    required: true,
  },
  {
    id: "reason",
    field: "reason",
    label: "Why is support needed?",
    placeholder: "Context for assistance",
    required: true,
  },
  {
    id: "category",
    field: "category",
    label: "Select case category",
    type: "select",
    options: ["Education", "Health", "Food", "Emergency", "Housing", "Other"],
    required: true,
  },
];
