import type { Metadata } from "next";

import { Body, Main, Header, HeaderLogo } from "@a01sa01to/ui";

import "@a01sa01to/ui/style.css";

export const metadata: Metadata = {
  title: "CP Review (a01sa01to)",
  description: "競プロ振り返りツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <Body>
        <Header>
          <HeaderLogo>CP Review (a01sa01to)</HeaderLogo>
        </Header>
        <Main>{children}</Main>
        <footer></footer>
      </Body>
    </html>
  );
}
