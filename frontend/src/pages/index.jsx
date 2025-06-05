import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, buttonText, gradient, onClick }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex-1 flex flex-col items-center text-center border border-slate-100 min-w-0"
    >
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
            <svg className={`w-10 h-10 ${gradient.split(' ')[2]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-600 text-base leading-relaxed mb-8">
            {description}
        </p>
        <motion.button
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-full px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group`}
        >
            {buttonText}
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
        </motion.button>
    </motion.div>
);

function Index() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
            title: "Chat AI",
            description: "Assistenza immediata per qualsiasi domanda sulla salute. Il nostro chatbot è disponibile 24/7 per aiutarti.",
            buttonText: "Inizia a chattare",
            gradient: "from-violet-100 to-violet-50 text-violet-600",
            onClick: () => navigate('/chat')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            title: "Prenotazioni",
            description: "Prenota le tue visite mediche in pochi click. Scegli data e ora più comode per te.",
            buttonText: "Prenota ora",
            gradient: "from-rose-100 to-rose-50 text-rose-600",
            onClick: () => navigate('/book')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            title: "Profilo",
            description: "Gestisci i tuoi dati e appuntamenti in un unico posto. Mantieni tutto sotto controllo.",
            buttonText: "Gestisci profilo",
            gradient: "from-amber-100 to-amber-50 text-amber-600",
            onClick: () => navigate('/profile')
        }
    ];

    return (
        <div className="flex flex-row items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
            <header className="w-full flex justify-between items-center p-4 bg-white shadow-md">
                <h1 className="text-3xl font-bold text-blue-600">Il tuo assistente per la salute</h1>
                <div className="space-x-4">
                <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Registrati
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Login
                </button>
                </div>
            </header>

            <main className="flex flex-row items-center justify-center flex-grow space-y-6 mt-10">
                <button
                onClick={() => navigate('/chat')}
                className="w-64 py-4 bg-indigo-500 text-white text-xl rounded-xl shadow hover:bg-indigo-600"
                >
                Chat
                </button>
                <button
                onClick={() => navigate('/book')}
                className="w-64 py-4 bg-purple-500 text-white text-xl rounded-xl shadow hover:bg-purple-600"
                >
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default Index;