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
      <head></head>
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
