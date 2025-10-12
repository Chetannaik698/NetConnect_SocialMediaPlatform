import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

const NavbarComponent = () => {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h1
          onClick={() => {
            router.push("/");
          }}
          style={{ cursor: "pointer" }}
        >
          Pro Connect
        </h1>

        <div className={styles.navBarOptionContainer}>
          {authState.profileFetched && (
            <div>
              <div style={{ display: "flex", gap: "1.2rem" }}>
                {/* <p>Hey, {authState.user.userId.name}</p> */}
                <p
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </p>

                <p
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                    dispatch(reset());
                  }}
                >
                  Logout
                </p>
              </div>
            </div>
          )}

          {!authState.profileFetched && (
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <p>Be a part</p>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default NavbarComponent;
