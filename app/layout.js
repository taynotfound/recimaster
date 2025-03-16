import { Mukta } from "next/font/google";
import "./globals.css";
import BlueskyIcon from '../public/icons/bluesky.svg';
import CopyIcon from '../public/icons/copy.svg';
import DiscordIcon from '../public/icons/discord.svg';
import FacebookIcon from '../public/icons/facebook.svg';
import GithubIcon from '../public/icons/github.svg';
import WebsiteIcon from '../public/icons/website.svg';
import WhatsappIcon from '../public/icons/whatsapp.svg';
import YoutubeIcon from '../public/icons/youtube.svg';

const inter = Mukta({ subsets: ["latin"], weight: "700" });

export const metadata = {
  title: "ReciMaster",
  description: "ReciMaster is your AI powered Recipe Master",
  image: "/logo.png",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <style>{inter.styles}</style>
        </head>
      <body className={inter.className}>
       {children}
      </body>
    </html>
  );
}
