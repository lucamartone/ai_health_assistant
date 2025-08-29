import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import FeatureCard from '../../components/FeatureCard';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Shield, Users, Clock, CheckCircle, Star } from 'lucide-react';

function Index() {
    const navigate = useNavigate();
    const { account, loading } = useAuth();

    // Reindirizza al profilo se l'utente è già autenticato
    useEffect(() => {
        if (!loading && account) {
            navigate('/hub/overview');
        }
    }, [account, loading, navigate]);

    const handleProfileClick = () => {
        if (account) {
            // Se l'utente è autenticato, vai al profilo
            navigate('/hub/overview');
        } else {
            // Se l'utente non è autenticato, vai al login
            navigate('/login');
        }
    };

    const features = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
            title: "Chat AI",
            description: "Assistenza immediata per qualsiasi domanda sulla salute.",
            buttonText: "Inizia a chattare",
            gradient: "from-violet-500 to-violet-600 text-violet-50",
            onClick: () => navigate('/chat')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            title: "Prenotazioni",
            description: "Prenota le tue visite mediche in pochi click. Scegli data e ora più comode per te.",
            buttonText: "Prenota ora",
            gradient: "from-rose-500 to-rose-600 text-rose-50",
            onClick: () => navigate('/book')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            title: "Profilo",
            description: "Gestisci i tuoi dati e appuntamenti in un unico posto. Mantieni tutto sotto controllo.",
            buttonText: "Gestisci profilo",
            gradient: "from-amber-500 to-amber-600 text-amber-50",
            onClick: handleProfileClick
        }
    ];

    const benefits = [
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Salute Prima di Tutto",
            description: "La tua salute è la nostra priorità assoluta. Ogni funzionalità è progettata per il tuo benessere."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Privacy Garantita",
            description: "I tuoi dati sanitari sono protetti con i più alti standard di sicurezza e crittografia."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Accessibilità Totale",
            description: "Servizi disponibili 24/7, ovunque tu sia. Gestisci la tua salute quando vuoi."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Risparmio di Tempo",
            description: "Prenotazioni in pochi click, assistenza immediata e gestione semplificata."
        }
    ];

    const testimonials = [
        {
            name: "Maria Rossi",
            role: "Paziente",
            content: "MediFlow ha semplificato completamente la gestione delle mie visite mediche. Fantastico!",
            rating: 5
        },
        {
            name: "Giuseppe Bianchi",
            role: "Paziente",
            content: "Il chatbot AI è incredibile, risponde sempre alle mie domande sulla salute.",
            rating: 5
        },
        {
            name: "Laura Verdi",
            role: "Paziente",
            content: "Finalmente posso prenotare appuntamenti senza chiamare o andare in ambulatorio.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-25 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center relative z-10"
                >
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight"
                    >
                        Inizia a prenderti cura della tua{' '}
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100"
                        >
                            salute
                        </motion.span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="text-lg sm:text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed px-4"
                    >
                        Prenota visite mediche, consulta specialisti e ricevi assistenza immediata 
                        dal nostro chatbot AI. La tua salute è nelle mani giuste.
                    </motion.p>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-10 sm:pt-2 sm:pb-30">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col md:flex-row justify-between items-stretch gap-6 sm:gap-8 w-full"
                >
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </motion.div>
            </div>

            {/* Benefits Section */}
            <div className="py-16 px-4 sm:px-6 bg-white/90 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                            Perché Scegliere MediFlow
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Scopri i vantaggi di una piattaforma sanitaria moderna e affidabile
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-16 px-4 sm:px-6 bg-blue-600">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Cosa Dicono i Nostri Utenti
                        </h2>
                        <p className="text-xl text-blue-100">
                            Le esperienze di chi ha già scelto MediFlow
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-blue-50 mb-4 italic">
                                    "{testimonial.content}"
                                </p>
                                <div className="text-blue-100">
                                    <div className="font-semibold">{testimonial.name}</div>
                                    <div className="text-sm opacity-75">{testimonial.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-700 to-blue-800">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Inizia Oggi la Tua Esperienza
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Unisciti a migliaia di persone che hanno già scelto MediFlow 
                            per la loro salute digitale.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-300"
                        >
                            Registrati Ora
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Index;