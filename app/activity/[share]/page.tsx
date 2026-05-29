import { ContentProvider } from "../../../lib/context/ContentContext";
import PortfolioClient from "../../../components/PortfolioClient";

export default function SharedActivityPage() {
  return (
    <ContentProvider>
      <PortfolioClient />
    </ContentProvider>
  );
}
