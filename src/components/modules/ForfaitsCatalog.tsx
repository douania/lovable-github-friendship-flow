import ForfaitsCatalogEnhanced from './ForfaitsCatalogEnhanced';
import { Forfait } from '../../types';

interface ForfaitsCatalogProps {
  onForfaitSelect: (forfait: Forfait) => void;
}

export default function ForfaitsCatalog({ onForfaitSelect }: ForfaitsCatalogProps) {
  return <ForfaitsCatalogEnhanced onForfaitSelect={onForfaitSelect} />;
}
