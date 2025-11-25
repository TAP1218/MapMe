// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Find My Location",
  description: "Map of Arizona that shows your current location",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}