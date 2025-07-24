import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function PanoramicaTab() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile?tab=profile');
  };

  const features = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      ),
      title: 'Chat AI',
      description: 'Assistenza immediata per qualsiasi domanda sulla salute.',
      buttonText: 'Inizia a chattare',
      gradient: 'from-violet-500 to-violet-600 text-violet-50',
      onClick: () => navigate('/chat'),
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
      title: 'Prenotazioni',
      description:
        'Prenota le tue visite mediche in pochi click. Scegli data e ora più comode per te.',
      buttonText: 'Prenota ora',
      gradient: 'from-rose-500 to-rose-600 text-rose-50',
      onClick: () => navigate('/book'),
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7h18M3 12h18M3 17h18"
        />
      ),
      title: 'Cartella Clinica',
      description:
        'Consulta i tuoi documenti sanitari, diagnosi, prescrizioni e referti in modo semplice.',
      buttonText: 'Apri cartella',
      gradient: 'from-amber-500 to-amber-600 text-amber-50',
      onClick: () => navigate('/profile/clinical-folder'),
    },
  ];

  const FeatureCard = ({ icon, title, description, buttonText, gradient, onClick }) => (
    <div
      className={`flex-1 rounded-2xl p-6 shadow-md bg-gradient-to-br ${gradient} flex flex-col justify-between`}
    >
      <div>
        <div className="w-12 h-12 mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-6 inline-block bg-white text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow hover:bg-white/90 transition"
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-10 sm:pt-2 sm:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-col md:flex-row justify-between items-stretch gap-6 sm:gap-8 w-full"
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </motion.div>
    </div>
  );
}

export default PanoramicaTab;
