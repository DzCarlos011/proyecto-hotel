import React, { useState } from "react";
import Axios from "axios";
import styles from "./login.module.css";
import { getImageUrl } from "../../utils";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [completed, setCompleted] = useState(0);

  const login = () => {
    Axios.post("http://localhost:3001/login", {
      email: email,
      contrasena: contrasena,
    })
      .then((response) => {
        // Manejar la respuesta del servidor en caso de éxito
        localStorage.setItem("token", response.data.token); // Almacena el token en localStorage
        setCompleted(1);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        // Aquí puedes redirigir al usuario o realizar otras acciones necesarias.
      })
      .catch((error) => {
        // Manejar errores en caso de fallo en el inicio de sesión
        setCompleted(2);
        console.error("Error de inicio de sesión:", error);
      });
  };

  return (
    <>
      <div className={styles.navbar}>
        <img src={getImageUrl("navbar/logo.png")} />
      </div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.welcome}>LOGIN</div>
        </div>
      </div>
      <div className={styles.container2}>
        <form>
          <label for="email" class="form-label" className={styles.description}>
            Email:
          </label>
          <br></br>
          <input
            type="email"
            class="form-control"
            className={styles.entradas}
            id="email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          ></input>
          <br></br>

          <label
            for="password"
            class="form-label"
            className={styles.description}
          >
            Password
          </label>
          <br></br>
          <input
            type="password"
            class="form-control"
            className={styles.entradas}
            id="password"
            placeholder="Enter your password"
            name="password"
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
          ></input>
          <br></br>
          <center>
            {completed == 1 ? (
              <div class="alert alert-dismissible alert-success">
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="alert"
                ></button>
                <strong>Well done!</strong> You logged succesfully, enjoy!.
              </div>
            ) : completed == 2 ? (
              <div className="alert alert-dismissible alert-danger">
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                ></button>
                <strong>Oops!</strong> Something went wrong.
              </div>
            ) : null}
            <a className={styles.bookBtn} onClick={login}>
              LOGIN
            </a>
            <br></br>
            <br></br>
            <a href="/sign-up">I don't have an account</a>
          </center>
        </form>
      </div>
    </>
  );
};
