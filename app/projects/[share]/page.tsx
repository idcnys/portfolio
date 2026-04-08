import { ContentProvider } from "../../../lib/context/ContentContext";
import PortfolioClient from "../../../components/PortfolioClient";

export default function SharedProjectPage() {
  return (
    <ContentProvider>
      <PortfolioClient />
    </ContentProvider>
  );
}
