import { useEffect, useState } from 'react';
import {get_to_rank_appointments} from '../../services/appointments/fetch_appointments'

function RankTab({account}){
    //const
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);  //app selezionato per la valutaz
    const [rating, setRating] = useState(0);              //voto scelto
    const [error, setError] = useState('');


    const openModalForRank = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        //funzione per aprire il modale di valutazione
        console.log("funzione per la valutazione da implementare");
    };

    useEffect(() => {
        if (!account?.id) {  
          return;
        }

        setError('');

        //popola appointment con fecth a api
        get_to_rank_appointments(account.id)
          .then(data =>{
            setAppointments(data.appointments || [])})
          .catch(err => {
            setError(err.message);
          } );

      }, [account]);

    const formatDate = (date) =>
     new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    

    return(
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Appunamenti da valutare</h2>

      { error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Nessuno appuntamento trovato.</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, index) => {
            const dateObj = new Date(apt.date_time);
            const formattedDate = formatDate(dateObj);
            const formattedTime = dateObj.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">
                  Dott. {apt.doctor_surname} ({apt.specialization})
                </p>
                <p className="text-sm text-gray-500">
                  {formattedDate} - {formattedTime}
                </p>
                <p className="text-sm text-gray-500">
                  Luogo: {apt.address}, {apt.city}
                </p>
                <p className="text-sm text-gray-500">Prezzo: €{apt.price}</p>
              </div>
              <button
                  onClick={() => openModalForRank(apt.id)}  //manca la parte di logica per valutare tramite il modale
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Valuta
                </button>
            </div>
          </div>
            );
          })}
        </div>
      )}
    </div>
    );
}

export default RankTab;