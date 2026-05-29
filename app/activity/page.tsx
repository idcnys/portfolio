import { ContentProvider } from "../../lib/context/ContentContext";
import PortfolioClient from "../../components/PortfolioClient";

export default function ActivityPage() {
  return (
    <ContentProvider>
      <PortfolioClient />
    </ContentProvider>
  );
}
