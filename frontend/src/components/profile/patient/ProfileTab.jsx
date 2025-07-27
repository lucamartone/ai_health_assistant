import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { editPatientProfile } from '../../../services/profile/fetch_patient_profile';
import { fetchUpdatedAccount } from '../../../services/profile/fetch_profile';
import { UploadIcon, PlusIcon, Trash2Icon, UserIcon, PencilIcon } from 'lucide-react';

function ProfileTab() {
  const { account, setAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState(account.name || '');
  const [surname, setSurname] = useState(account.surname || '');
  const [phone, setPhone] = useState(account.phone || '');
  const [profileImg, setProfileImg] = useState(account.profile_img || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const originalData = {
    name: account.name || '',
    surname: account.surname || '',
    phone: account.phone || '',
    profile_img: account.profile_img || null
  };

  const hasChanges =
    name !== originalData.name ||
    surname !== originalData.surname ||
    phone !== originalData.phone ||
    (selectedFile !== null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      let base64Image = profileImg;
      if (selectedFile) base64Image = await toBase64(selectedFile);

      await editPatientProfile(name, surname, phone, account.email, base64Image);
      const updatedAccount = await fetchUpdatedAccount();
      setAccount(updatedAccount);
      setProfileImg(updatedAccount.profile_img);
      setSuccessMsg('Dati aggiornati con successo');
      setIsEditing(false);
      navigate(location.pathname, { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg("Errore durante l'aggiornamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImg(null);
    setSelectedFile(null);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  useEffect(() => {
    if (!isEditing) {
      setName(originalData.name);
      setSurname(originalData.surname);
      setPhone(originalData.phone);
      setProfileImg(originalData.profile_img);
      setSelectedFile(null);
    }
  }, [isEditing]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Profilo Personale</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          <PencilIcon size={20} />
        </button>
      </div>

      {/* Form + Foto */}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 items-start">
        {/* FOTO */}
        <div className="flex flex-col items-center">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer group"
            onClick={() => isEditing && fileInputRef.current.click()}
          >
            {profileImg ? (
              <img src={profileImg} alt="Foto profilo" className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl group-hover:text-blue-500">
                {isEditing ? <PlusIcon size={32} /> : <UserIcon size={32} />}
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-4">
                  <UploadIcon size={24} className="text-white" />
                  {profileImg && (
                    <Trash2Icon
                      size={24}
                      className="text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* CAMPI */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-right sm:col-span-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className="sm:col-span-2 px-4 py-2 border rounded-lg w-full"
            />

            <label className="text-sm font-medium text-right sm:col-span-1">Cognome</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              disabled={!isEditing}
              className="sm:col-span-2 px-4 py-2 border rounded-lg w-full"
            />

            <label className="text-sm font-medium text-right sm:col-span-1">Telefono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              className="sm:col-span-2 px-4 py-2 border rounded-lg w-full"
            />
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={!hasChanges || isLoading}
                className={`px-6 py-2 rounded-lg text-white ${
                  hasChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Salvando...' : 'Salva'}
              </button>
            </div>
          )}

          {successMsg && <p className="text-green-600 text-sm mt-4">{successMsg}</p>}
          {errorMsg && <p className="text-red-600 text-sm mt-4">{errorMsg}</p>}
        </div>
      </form>

      {/* INFO NON MODIFICABILI - UNA SOLA RIGA */}
      <div className="mt-10 pt-6 border-t">
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          {/* EMAIL */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <span className="text-sm">{account.email}</span>
          </div>

          {/* DATA CREAZIONE */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Creazione account:</span>
            <span className="text-sm">10 luglio 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileTab;
