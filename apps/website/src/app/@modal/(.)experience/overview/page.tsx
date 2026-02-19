// apps/website/src/app/@modal/(.)experience/[role]/page.tsx
import ModalShell from "@/_components/ModalShell";
import ExperienceSurvey from "@/_components/ExperienceSurvey";

export default function ExperienceIntercept() {
  return (
    <ModalShell>
      <ExperienceSurvey />
    </ModalShell>
  );
}
