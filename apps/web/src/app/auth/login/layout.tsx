//apps/src/web/auth/Layout.tsx

export const metadata = {
  title: "PostWins",
  description: "Login & Kep the Record clean",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
