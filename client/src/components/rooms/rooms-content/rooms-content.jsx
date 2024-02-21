import 'react-datepicker/dist/react-datepicker.css';

import React, {
  useEffect,
  useState,
} from 'react';

import Axios from 'axios';
import {
  differenceInDays,
} from 'date-fns'; // Importa la función differenceInDays
import DatePicker from 'react-datepicker';

import { getImageUrl } from '../../../utils';
import styles from './rooms-content.module.css';

export function Rooms_content() {
  // CONSTANTES PARA EL MODAL
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [numberOfNights, setNumberOfNights] = useState(null); // Estado para almacenar el número de noches
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // CONSTANTES PARA LOS FETCH
  const [habitaciones, setHabitaciones] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [fecha_llegada, setFecha_llegada] = useState("");
  const [fecha_salida, setFecha_salida] = useState("");
  const [total_pago, setTotalPago] = useState(0);
  const [id_usuario, setIdUsuario] = useState(0);
  const [id_habitacion, setIdHabitacion] = useState(0);
  const [pago, setPago] = useState("")

  // SECCIÓN PARA LOS FETCH
  useEffect(() => {
    getHabitaciones();
    getUsuario();
  }, []);

  const getHabitaciones = () => {
    Axios.get("http://localhost:3001/getRooms")
      .then((response) => {
        setHabitaciones(response.data);
      })
      .catch((error) => {
        console.log("Error: No se pueden obtener las habitaciones", error);
      });
  };

  const getUsuario = () => {
    const token = localStorage.getItem('token'); // Obtener el token de localStorage
    Axios.get("http://localhost:3001/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        setUsuario(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log("Error: No se puede obtener el usuario", error);
      });
  };

  const postPago = () => {
    Axios.post("http://localhost:3001/create-checkout-session",{
      total_pago: total_pago,
      fecha_llegada : fecha_llegada,
      fecha_salida : fecha_salida,
      id_usuario : id_usuario,
      id_habitacion : id_habitacion,
    })
      .then((response) => {
        setPago(response.data);
        console.log(response.data);
        window.location.href = response.data.url;
      })
      .catch((error) => {
        console.log("Error: No se pudo concretar el pago", error);
      });
  }

  // FUNCIONES PARA EL MODAL


 const openModal = (room) => {
  setIsModalOpen(true);
  setSelectedRoom(room);
  calculateTotalPayment();
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedRoom(null);
};

const handleArrivalDateChange = (date) => {
  setArrivalDate(date);
  calculateNumberOfNights(date, departureDate);
};

const handleDepartureDateChange = (date) => {
  setDepartureDate(date);
  calculateNumberOfNights(arrivalDate, date);
};

const calculateNumberOfNights = (arrival, departure) => {
  if (arrival && departure) {
    const nights = differenceInDays(departure, arrival);
    setNumberOfNights(nights);
    calculateTotalPayment();
  }
};

useEffect(() => {
  if (total_pago > 0) {
    postPago();
  }
}, [total_pago]);


  const calculateTotalPayment = () => {
    if (selectedRoom && numberOfNights) {
      const totalPago = selectedRoom.precio * numberOfNights;
      const idUsuario = usuario && usuario[0] ? usuario[0].id_usuario : 'Nombre no disponible'
      const llegada = arrivalDate;
      const salida = departureDate;
      const habitacion = selectedRoom.id_habitacion;

      setIdHabitacion(habitacion);
      setFecha_salida(salida);
      setFecha_llegada(llegada);
      setIdUsuario(idUsuario);
      setTotalPago(totalPago);
      postPago();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>ROOMS AND RATES</div>
      <div className={styles.text}>Each of our bright, light-flooded rooms come with everything you could possibly need for a comfortable stay. And yes,
      comfort isn’t our only objective, we also value good design, sleek contemporary furnishing complemented
      by the rich tones of nature’s palette as visible from our rooms’ sea-view windows and terraces.</div>
      {habitaciones.length > 0 ? (
        habitaciones.map((habitacion) => (
          <div className={styles.cardContainer} key={habitacion.id}>
            <img className={styles.image} src={getImageUrl(`${habitacion.imagen}`)} />
            <div className={styles.cardBanner}>
              <center>
                <div className={styles.cardTitle}>{habitacion.tipo_de_habitacion}</div>
              </center>
            </div>
            <div className={styles.containerBtn}>
              <a className={styles.bookBtn} onClick={() => openModal(habitacion)}>Book Now</a>
              <div className={styles.textPrecio}>Price: ${habitacion.precio} per night</div>
            </div>
          </div>
        ))
      ) : (
        <p>No hay datos disponibles</p>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.closeBtn} onClick={closeModal}>&times;</span>
            <p className={styles.titulo1}>Room: {selectedRoom.tipo_de_habitacion}</p>
            <p className={styles.usuario1}> User Name: {usuario && usuario[0] ? usuario[0].nombre : 'Nombre no disponible'}</p>
            <p className={styles.preciofinal}>Price: ${selectedRoom.precio} per night</p>
            <div className={styles.date}>
              <p className={styles.fecha}>Arrival Date:</p>
              <DatePicker className={styles.renglon}selected={arrivalDate} onChange={handleArrivalDateChange} />
            </div>
            <div>
              <p className={styles.fecha}>Departure Date:</p>
              <DatePicker className={styles.renglon} selected={departureDate} onChange={handleDepartureDateChange} />
            </div>
            <p className={styles.fecha}>Number of Nights: {numberOfNights}</p>
            <p className={styles.preciofinal}>Total payment: ${selectedRoom.precio * numberOfNights}</p>
            <button type="button" className={styles.btn} onClick={calculateTotalPayment}>Book Now</button>
            
          </div>
        </div>
      )}

    </div>
  );
}