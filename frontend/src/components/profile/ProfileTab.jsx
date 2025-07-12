import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { edit_profile, fetch_updated_account } from '../../services/profile/fetch_profile';
import { UploadIcon, PlusIcon, Trash2Icon, UserIcon } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let base64Image = profileImg;

      if (selectedFile) {
        base64Image = await toBase64(selectedFile);
      }

      await edit_profile(name, surname, phone, account.email, base64Image);
      const updatedAccount = await fetch_updated_account();

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
      reader.onloadend = () => {
        setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImg(null);
    setSelectedFile(null);
    setAccount(prev => ({ ...prev, profile_img: null }));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Dati Personali</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {isEditing ? 'Annulla' : 'Modifica'}
        </button>
      </div>

      {/* FOTO PROFILO */}
      <div className="flex justify-center mb-6">
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer group"
          onClick={() => isEditing && fileInputRef.current.click()}
        >
          {profileImg ? (
            <img
              src={profileImg}
              alt="Foto profilo"
              className="object-cover w-full h-full"
            />
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm">Cognome</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm">Telefono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        {isEditing && (
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salva'}
          </button>
        )}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
      </form>
    </div>
  );
}

export default ProfileTab;
