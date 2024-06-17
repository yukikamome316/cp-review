import type { Metadata } from "next";

import { Body, Main, Header, HeaderLogo } from "@a01sa01to/ui";

import "@a01sa01to/ui/style.css";

export const metadata: Metadata = {
  title: "CP Review (yukikamome316)",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap&text=%20-_:()%E6%9C%80%E7%B5%82%E6%9B%B4%E6%96%B0%E5%B9%B4%E6%9C%88%E6%97%A5%E3%81%94%E3%82%8DABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789."
          rel="stylesheet"
        />
      </head>
      <Body>
        <Header>
          <HeaderLogo>CP Review (yukikamome316)</HeaderLogo>
        </Header>
        <Main>{children}</Main>
        <footer></footer>
      </Body>
    </html>
  );
}
