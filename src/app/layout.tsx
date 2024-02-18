import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CP-Review",
  description: "競プロ振り返りツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head></head>
      <body>
        <header></header>
        <main>{children}</main>
        <footer></footer>
      </body>
    </html>
  );
}
