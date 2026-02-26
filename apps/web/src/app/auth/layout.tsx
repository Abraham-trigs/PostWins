// apps/web/src/app/auth/layout.tsx

export const metadata = {
  title: "PostWins",
  description: "Login & keep the Record clean",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
