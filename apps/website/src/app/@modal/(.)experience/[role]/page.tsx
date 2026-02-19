// apps/website/src/app/@modal/(.)experience/[role]/page.tsx
import ModalShell from "@/components/ModalShell";
import ExperienceSurvey from "@/components/ExperienceSurvey";

export default function ExperienceIntercept() {
  return (
    <ModalShell>
      <ExperienceSurvey />
    </ModalShell>
  );
}
