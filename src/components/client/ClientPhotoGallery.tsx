import React, { useState, useEffect } from 'react';
import { Image, Calendar, MapPin, FileText, ZoomIn } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { photoService, PatientPhoto } from '../../services/photoService';
import { useToast } from '../../hooks/use-toast';

const ClientPhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<PatientPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{ photo: PatientPhoto; url: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'before' | 'after' | 'progress'>('all');
  const { client } = useClientAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (client?.patientId) {
      loadPhotos();
    }
  }, [client]);

  const loadPhotos = async () => {
    if (!client?.patientId) return;

    try {
      setLoading(true);
      const data = await photoService.getPatientPhotos(client.patientId);
      setPhotos(data);
    } catch (err) {
      console.error('Erreur lors du chargement des photos:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case 'before':
        return 'Avant';
      case 'after':
        return 'Après';
      case 'progress':
        return 'Progrès';
      default:
        return type;
    }
  };

  const getPhotoTypeBadge = (type: string) => {
    switch (type) {
      case 'before':
        return 'bg-blue-100 text-blue-700';
      case 'after':
        return 'bg-green-100 text-green-700';
      case 'progress':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPhotos = photos.filter(photo => 
    filter === 'all' || photo.photo_type === filter
  );

  const openPhotoModal = async (photo: PatientPhoto) => {
    try {
      const url = await photoService.getPhotoUrl(photo.storage_path);
      setSelectedPhoto({ photo, url });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la photo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Galerie Photos</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{photos.length}</p>
            <p className="text-sm text-gray-600">Photos totales</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {photos.filter(p => p.photo_type === 'before').length}
            </p>
            <p className="text-sm text-blue-700">Avant</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {photos.filter(p => p.photo_type === 'after').length}
            </p>
            <p className="text-sm text-green-700">Après</p>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {photos.filter(p => p.photo_type === 'progress').length}
            </p>
            <p className="text-sm text-purple-700">Progrès</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-pink-100 text-pink-700 border-2 border-pink-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('before')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'before'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Avant
          </button>
          <button
            onClick={() => setFilter('after')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'after'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Après
          </button>
          <button
            onClick={() => setFilter('progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'progress'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Progrès
          </button>
        </div>
      </div>

      {/* Galerie */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des photos...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aucune photo disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onView={openPhotoModal}
              getPhotoTypeBadge={getPhotoTypeBadge}
              getPhotoTypeLabel={getPhotoTypeLabel}
            />
          ))}
        </div>
      )}

      {/* Modal photo agrandie */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto.photo}
          url={selectedPhoto.url}
          onClose={() => setSelectedPhoto(null)}
          getPhotoTypeLabel={getPhotoTypeLabel}
        />
      )}
    </div>
  );
};

interface PhotoCardProps {
  photo: PatientPhoto;
  onView: (photo: PatientPhoto) => void;
  getPhotoTypeBadge: (type: string) => string;
  getPhotoTypeLabel: (type: string) => string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onView, getPhotoTypeBadge, getPhotoTypeLabel }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    loadImage();
  }, [photo]);

  const loadImage = async () => {
    try {
      const url = await photoService.getPhotoUrl(photo.storage_path);
      setImageUrl(url);
    } catch (err) {
      console.error('Erreur chargement image:', err);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gray-100">
        {imageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={`Photo ${getPhotoTypeLabel(photo.photo_type)}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onView(photo)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <ZoomIn className="w-12 h-12 text-white" />
            </button>
          </>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${getPhotoTypeBadge(photo.photo_type)}`}>
          {getPhotoTypeLabel(photo.photo_type)}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(photo.photo_date).toLocaleDateString('fr-FR')}
        </div>

        {photo.treatment_area && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {photo.treatment_area}
          </div>
        )}

        {photo.notes && (
          <div className="flex items-start text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2">{photo.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface PhotoModalProps {
  photo: PatientPhoto;
  url: string;
  onClose: () => void;
  getPhotoTypeLabel: (type: string) => string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, url, onClose, getPhotoTypeLabel }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Photo {getPhotoTypeLabel(photo.photo_type)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(photo.photo_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="p-6">
          <img
            src={url}
            alt={`Photo ${getPhotoTypeLabel(photo.photo_type)}`}
            className="w-full h-auto rounded-lg"
          />

          {(photo.treatment_area || photo.notes) && (
            <div className="mt-6 space-y-3">
              {photo.treatment_area && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2 text-pink-600" />
                  <span className="font-medium">Zone traitée:</span>
                  <span className="ml-2">{photo.treatment_area}</span>
                </div>
              )}

              {photo.notes && (
                <div className="flex items-start text-gray-700">
                  <FileText className="w-5 h-5 mr-2 mt-0.5 text-pink-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="mt-1">{photo.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPhotoGallery;
