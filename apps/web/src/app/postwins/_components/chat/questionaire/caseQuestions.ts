// Purpose: Defines the conversational intake flow for creating a case.

export type CaseQuestion = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "select";
  options?: string[];
};

export const caseQuestions: CaseQuestion[] = [
  {
    id: "beneficiaryName",
    label: "Who is this case about?",
    placeholder: "Enter beneficiary full name",
    required: true,
  },
  {
    id: "issue",
    label: "What is the main issue?",
    placeholder: "Describe the problem",
    required: true,
  },
  {
    id: "location",
    label: "Where did it happen?",
    placeholder: "City / district / area",
  },
  {
    id: "reason",
    label: "Why is support needed?",
    placeholder: "Explain why assistance is needed",
    required: true,
  },
  {
    id: "category",
    label: "Select case category",
    type: "select",
    options: ["Education", "Health", "Food", "Emergency", "Housing", "Other"],
  },
];
