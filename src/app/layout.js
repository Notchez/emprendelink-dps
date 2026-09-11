import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "EmprendeLink",
  description: "Plataforma de gestión para microemprendedores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
