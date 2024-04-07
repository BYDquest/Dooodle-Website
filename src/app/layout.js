import "./globals.css";

export const metadata = {
  title: "Ugly Avatar",
  description: "Ugly Avatar NFT",

};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
      <link rel="icon" href="/favicon.svg" sizes="any" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
