import React, { useState, useRef } from 'react';
import { Camera, Upload, Eye, Trash2, Download, FolderPlus, Search } from 'lucide-react';

interface PhotoData {
  id: string;
  url: string;
  name: string;
  patientId?: string;
  consultationId?: string;
  type: 'before' | 'after' | 'document';
  uploadDate: string;
  size: number;
  tags: string[];
}

const EnhancedPhotoManager: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<PhotoData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulation des données photos
  React.useEffect(() => {
    const mockPhotos: PhotoData[] = [
      {
        id: '1',
        url: '/api/placeholder/300/200',
        name: 'Patient_001_avant.jpg',
        patientId: 'patient-1',
        type: 'before',
        uploadDate: '2024-01-15T10:30:00Z',
        size: 245760,
        tags: ['visage', 'traitement-laser']
      },
      {
        id: '2',
        url: '/api/placeholder/300/200',
        name: 'Patient_001_apres.jpg',
        patientId: 'patient-1',
        type: 'after',
        uploadDate: '2024-01-15T11:45:00Z',
        size: 198432,
        tags: ['visage', 'traitement-laser']
      }
    ];
    setPhotos(mockPhotos);
  }, []);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Créer un aperçu local
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PhotoData = {
          id: Date.now().toString() + i,
          url: e.target?.result as string,
          name: file.name,
          type: 'document',
          uploadDate: new Date().toISOString(),
          size: file.size,
          tags: []
        };
        
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    }
    
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesType = filterType === 'all' || photo.type === filterType;
    const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const deleteSelectedPhotos = () => {
    if (confirm(`Supprimer ${selectedPhotos.length} photo(s) ?`)) {
      setPhotos(prev => prev.filter(photo => !selectedPhotos.includes(photo.id)));
      setSelectedPhotos([]);
    }
  };

  const downloadPhoto = (photo: PhotoData) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'after': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'before': return 'Avant';
      case 'after': return 'Après';
      case 'document': return 'Document';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestionnaire de Photos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              Liste
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            <Upload className="w-4 h-4" />
            <span>Ajouter photos</span>
          </button>
        </div>
      </div>

      {/* Zone de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par nom ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="all">Tous les types</option>
          <option value="before">Photos avant</option>
          <option value="after">Photos après</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Actions en lot */}
      {selectedPhotos.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-pink-800 font-medium">
              {selectedPhotos.length} photo(s) sélectionnée(s)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={deleteSelectedPhotos}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone de dépôt */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 hover:bg-pink-50 transition-colors"
      >
        <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Glissez vos photos ici ou cliquez pour sélectionner
        </p>
        <p className="text-sm text-gray-500">
          Formats supportés: JPG, PNG, GIF (max 10MB par fichier)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
        >
          Parcourir les fichiers
        </button>
      </div>

      {/* Input de fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Grille/Liste des photos */}
      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Upload en cours...</p>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                selectedPhotos.includes(photo.id) ? 'border-pink-500' : 'border-transparent'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-32 object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadPhoto(photo)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox de sélection */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedPhotos.includes(photo.id)}
                  onChange={() => togglePhotoSelection(photo.id)}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
              </div>

              {/* Badge de type */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(photo.type)}`}>
                  {getTypeText(photo.type)}
                </span>
              </div>

              {/* Nom du fichier */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                <p className="text-xs truncate">{photo.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPhotos(filteredPhotos.map(p => p.id));
                      } else {
                        setSelectedPhotos([]);
                      }
                    }}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPhotos.map((photo) => (
                <tr key={photo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.includes(photo.id)}
                      onChange={() => togglePhotoSelection(photo.id)}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img className="w-10 h-10 object-cover rounded" src={photo.url} alt={photo.name} />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{photo.name}</p>
                        {photo.tags.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Tags: {photo.tags.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(photo.type)}`}>
                      {getTypeText(photo.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatFileSize(photo.size)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(photo.uploadDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4 relative">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-2 -right-2 p-2 bg-white rounded-full hover:bg-gray-100 z-10"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
              <h3 className="font-medium">{previewPhoto.name}</h3>
              <p className="text-sm opacity-75">
                {getTypeText(previewPhoto.type)} • {formatFileSize(previewPhoto.size)} • 
                {new Date(previewPhoto.uploadDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* État vide */}
      {filteredPhotos.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune photo trouvée</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Aucune photo ne correspond à vos critères de recherche'
              : 'Commencez par ajouter vos premières photos'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedPhotoManager;