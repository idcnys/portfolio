import { ContentProvider } from "../../lib/context/ContentContext";
import PortfolioClient from "../../components/PortfolioClient";

export default function ProjectsPage() {
  return (
    <ContentProvider>
      <PortfolioClient />
    </ContentProvider>
  );
}
