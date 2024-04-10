import "./globals.css";

export const metadata = {
  title: " Dooodle NFT | $DOOO Token ",
  description: ` $DOOO is a cryptocurrency based on Doooodle NFT.
  "Dooodle," an exclusive NFT collection. These unique, digital assets feature doodle-style avatars that embody the spirit of Just DOOOO it.
  `,
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
