import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import FeatureCard from '../../components/FeatureCard';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Shield, Users, Clock, CheckCircle, Star, Stethoscope, FileText } from 'lucide-react';

function Index() {
    const navigate = useNavigate();
    const { account, loading } = useAuth();

    useEffect(() => {
        if (!loading && account) {
            navigate('/doctor/hub/overview');
        }
    }, [account, loading, navigate]);

    const handleProfileClick = () => {
        if (account) {
            // Se il dottore è autenticato, vai al profilo
            navigate('/doctor/hub/profile');
        } else {
            // Se il dottore non è autenticato, vai al login
            navigate('/doctor/login');
        }
    };

    const handleAppointmentClick = () => {
        if (account) {
            console.log("  ACCOUNT del DOTTORE", account);
            // Se il dottore è autenticato, vai al profilo
            navigate('/doctor/appointments');
        } else {
            // Se il dottore non è autenticato, vai al login
            navigate('/doctor/login');
        }
    };

    const features = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            title: "Gestione Appuntamenti",
            description: "Visualizza e gestisci il tuo calendario di appuntamenti.",
            buttonText: "Gestisci appuntamenti",
            gradient: "from-emerald-500 to-emerald-600 text-emerald-50",
            onClick: handleAppointmentClick
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            title: "Profilo Professionale",
            description: "Gestisci le tue informazioni professionali, specializzazioni e sedi di lavoro.",
            buttonText: "Modifica profilo",
            gradient: "from-indigo-500 to-indigo-600 text-indigo-50",
            onClick: handleProfileClick
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
            title: "Cartelle Cliniche",
            description: "Accedi e gestisci le cartelle cliniche dei tuoi pazienti in modo sicuro e organizzato.",
            buttonText: "Visualizza cartelle",
            gradient: "from-blue-500 to-blue-600 text-blue-50",
            onClick: () => navigate('/doctor/patients')
        }
    ];

    const benefits = [
        {
            icon: <Stethoscope className="w-8 h-8" />,
            title: "Gestione Professionale",
            description: "Strumenti avanzati per gestire la tua pratica medica in modo efficiente e professionale."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Sicurezza Garantita",
            description: "I dati dei pazienti sono protetti con i più alti standard di sicurezza e crittografia."
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Cartelle Digitali",
            description: "Gestisci le cartelle cliniche in formato digitale, sempre accessibili e organizzate."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Risparmio di Tempo",
            description: "Automazione dei processi amministrativi per concentrarti sui tuoi pazienti."
        }
    ];

    const testimonials = [
        {
            name: "Dr. Marco Rossi",
            role: "Cardiologo",
            content: "MedFlow ha rivoluzionato la gestione del mio studio. Tutto è più organizzato e veloce.",
            rating: 5
        },
        {
            name: "Dr.ssa Anna Bianchi",
            role: "Pediatra",
            content: "Le cartelle cliniche digitali mi permettono di accedere ai dati dei pazienti ovunque.",
            rating: 5
        },
        {
            name: "Dr. Luca Verdi",
            role: "Dermatologo",
            content: "La gestione degli appuntamenti è diventata molto più semplice e intuitiva.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
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
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900 mb-6 sm:mb-8 leading-tight"
                    >
                        Inizia a gestire la tua{' '}
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"
                        >
                            Area Medica
                        </motion.span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto leading-relaxed px-4"
                    >
                        Gestisci appuntamenti, cartelle cliniche e il tuo profilo professionale in un unico posto.
                        Tutto ciò di cui hai bisogno per la tua professione medica.
                    </motion.p>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-20 sm:pt-2 sm:pb-30">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full"
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
                            Perché Scegliere MedFlow
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Scopri i vantaggi di una piattaforma sanitaria moderna per professionisti
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
                            Cosa Dicono i Nostri Medici
                        </h2>
                        <p className="text-xl text-blue-100">
                            Le esperienze di chi ha già scelto MedFlow
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
                            Unisciti a centinaia di medici che hanno già scelto MedFlow 
                            per la gestione della loro pratica professionale.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/doctor/register')}
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