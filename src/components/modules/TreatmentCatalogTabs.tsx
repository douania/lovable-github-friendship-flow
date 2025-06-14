
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SoinsCatalog from './SoinsCatalog';
import ForfaitsCatalog from './ForfaitsCatalog';
import { Forfait } from '../../types';

interface TreatmentCatalogTabsProps {
  onForfaitSelect: (forfait: Forfait) => void;
}

export default function TreatmentCatalogTabs({ onForfaitSelect }: TreatmentCatalogTabsProps) {
  return (
    <div className="p-6" style={{ backgroundColor: '#FDF6F3' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Catalogue des Soins et Forfaits</h1>
        <p className="text-gray-600">Gérez vos soins et forfaits de manière intuitive</p>
      </div>

      <Tabs defaultValue="soins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="soins" className="text-lg font-medium">
            Soins Individuels
          </TabsTrigger>
          <TabsTrigger value="forfaits" className="text-lg font-medium">
            Forfaits & Packages
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="soins" className="space-y-4">
          <SoinsCatalog />
        </TabsContent>
        
        <TabsContent value="forfaits" className="space-y-4">
          <ForfaitsCatalog onForfaitSelect={onForfaitSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
