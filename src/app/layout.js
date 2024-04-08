import "./globals.css";

export const metadata = {
  title: "RRR Doodlers NFT | $GRRR Token ",
  description: `Get Fucking Rich Social Experiment. $GRRR is a revolutionary cryptocurrency designed to help you unleash your inner financial beast and achieve unprecedented levels of wealth. Our mission is to create a powerful, community-driven ecosystem that empowers individuals to take control of their financial destinies. With $GRRR, you can participate in a rapidly growing market, benefit from cutting-edge tokenomics, and join a pack of like-minded wealth enthusiasts who share your hunger for success. Don't settle for a single "rich" - get rich, rich, rich with $GRRR! Join the $GRRR movement today and start your journey towards financial dominance.
  "RRR Doodlers," an exclusive NFT collection that perfectly complements the Get Rich Rich Rich Token ($GRRR) ecosystem. These unique, digital assets feature doodle-style avatars that embody the spirit of financial success and abundance. Each Rich Doodler is a quirky and expressive character that represents your journey towards unimaginable wealth. As a member of the $GRRR community, owning a RRR Doodler NFT is a testament to your commitment to the pack and your unwavering pursuit of financial greatness. Acquire a RRR Doodler and let it serve as your personal mascot on the path to becoming rich, rich, rich. Join the elite ranks of the $GRRR community and let your RRR Doodler NFT be a symbol of your financial prowess.
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
