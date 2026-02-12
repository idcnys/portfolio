import { ContentProvider } from "../lib/context/ContentContext";
import PortfolioClient from "../components/PortfolioClient";

export default function Home() {
  return (
    <ContentProvider>
      <PortfolioClient />
    </ContentProvider>
  );
}
