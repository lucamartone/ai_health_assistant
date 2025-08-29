import { motion } from 'framer-motion';
import { Heart, Shield, Users, Zap, Award, Globe, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Salute Prima di Tutto",
      description: "La salute dei nostri utenti è la nostra priorità assoluta. Ogni decisione e ogni funzionalità è progettata pensando al loro benessere."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy e Sicurezza",
      description: "Proteggiamo i tuoi dati sanitari con i più alti standard di sicurezza. La tua privacy è sacra per noi."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accessibilità",
      description: "Rendiamo l'assistenza sanitaria accessibile a tutti, indipendentemente da età, abilità o posizione geografica."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovazione Continua",
      description: "Utilizziamo le tecnologie più avanzate, come l'AI locale, per offrire servizi sempre migliori e più efficienti."
    }
  ];

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Prenotazioni Semplici",
      description: "Prenota visite mediche in pochi click, scegliendo data, ora e specialista preferito."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Chat AI Intelligente",
      description: "Assistenza immediata 24/7 con il nostro chatbot AI alimentato da modelli locali per la massima privacy."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Cartella Clinica Digitale",
      description: "Gestisci tutti i tuoi documenti sanitari in un unico posto sicuro e organizzato."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Recensioni Verificate",
      description: "Scegli i migliori specialisti basandoti su recensioni autentiche di altri pazienti."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Geolocalizzazione",
      description: "Trova i medici più vicini a te con la nostra funzione di ricerca geolocalizzata."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Notifiche Intelligenti",
      description: "Ricevi promemoria per appuntamenti e aggiornamenti importanti sulla tua salute."
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Chi Siamo
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              MediFlow è la piattaforma che rivoluziona l'assistenza sanitaria digitale, 
              mettendo la tecnologia al servizio della salute di tutti.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              La Nostra Missione
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Vogliamo democratizzare l'accesso all'assistenza sanitaria di qualità, 
              rendendo più semplice e immediato il rapporto tra pazienti e medici. 
              Attraverso l'innovazione tecnologica, creiamo un ecosistema sanitario 
              più efficiente, trasparente e centrato sulle persone.
            </p>
          </motion.div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Cosa Offriamo
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Una suite completa di strumenti digitali per gestire la tua salute 
              in modo semplice, sicuro e intelligente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>



      {/* Security Section */}
      <div className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Sicurezza e Privacy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              La protezione dei tuoi dati sanitari è la nostra priorità assoluta.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Protezione dei Dati
              </h3>
              <p className="text-gray-600 mb-6">
                Utilizziamo i più alti standard di sicurezza per proteggere le tue 
                informazioni personali e sanitarie, garantendo la massima privacy.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Crittografia end-to-end</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Conformità GDPR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Accesso controllato</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-2xl"
            >
              <div className="text-center">
                <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Sicurezza Garantita
                </h4>
                <p className="text-gray-600">
                  I tuoi dati sanitari sono protetti con i più alti standard 
                  di sicurezza e privacy.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-300"
              >
                Registrati come Paziente
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/doctor/register')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-300 border-2 border-white"
              >
                Registrati come Medico
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default About;
