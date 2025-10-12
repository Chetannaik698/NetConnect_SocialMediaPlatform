import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

const LoginComponent = () => {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [userLoginMethod, setUserloginMethod] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);

  const handleRegister = () => {
    if (!username || !password || !email || !name) {
      alert("All fields are required");
      return;
    }
    dispatch(registerUser({ username, name, email, password }));
  };

  const handleLogin = () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer__left}>
            <p className={styles.cardleft_heading}>
              {userLoginMethod ? "Sign in" : "Sign up"}
            </p>
            {authState?.message && (
              <p style={{ color: authState.isError ? "red" : "green" }}>
                {authState.message.message || authState.message}
              </p>
            )}

            <div className={styles.inputContainers}>
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    placeholder="Username"
                    className={styles.inputField}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    className={styles.inputField}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <input
                type="text"
                placeholder="Email"
                className={styles.inputField}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className={styles.inputField}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div
                onClick={() => {
                  userLoginMethod ? handleLogin() : handleRegister();
                }}
                className={styles.buttonWithOutline}
              >
                <p>{userLoginMethod ? "Sign in" : "Sign up"}</p>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer__right}>
            <p>
              {userLoginMethod
                ? "Don't Have an Account?"
                : "Already Have an Account?"}
            </p>
            <div
              onClick={() => {
                setUserloginMethod(!userLoginMethod);
              }}
              className={styles.buttonWithOutline}
              style={{ color: "black", textAlign: "center" }}
            >
              <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default LoginComponent;
