
import TreatmentCatalogTabs from './TreatmentCatalogTabs';
import { Forfait } from '../../types';

interface TreatmentCatalogProps {
  onForfaitSelect: (forfait: Forfait) => void;
}

export default function TreatmentCatalog({ onForfaitSelect }: TreatmentCatalogProps) {
  return <TreatmentCatalogTabs onForfaitSelect={onForfaitSelect} />;
}
