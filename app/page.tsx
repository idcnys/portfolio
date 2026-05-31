import { ContentProvider } from "../lib/context/ContentContext";
import PortfolioClientSSR from "../components/PortfolioClientSSR";
import ClientLoader from "../components/ClientLoader";

export default function Home() {
  return (
    <ContentProvider>
      <PortfolioClientSSR />
      <ClientLoader />
    </ContentProvider>
  );
}
