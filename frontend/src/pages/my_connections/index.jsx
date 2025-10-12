import { getMyConnectionRequests } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function MyConnections() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, []);

  useEffect(() => {
    if (authState.connectionRequest != 0) {
      console.log(authState.connectionRequest);
    }
  }, [authState.connectionRequest]);

  const connections = authState.connectionRequest?.connections
    ? Array.isArray(authState.connectionRequest.connections)
      ? authState.connectionRequest.connections
      : [authState.connectionRequest.connections] 
    : [];
    
  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>My Connections</h1>

          {connections.length > 0 ? (
            connections.map((conn) => (
              <div key={conn._id} className={styles.userCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div className={styles.profilePicture}>
                    <img
                      src={`${BASE_URL}/${conn.connectionId.profilePicture}`}
                      alt=""
                    />
                  </div>
                  <div className={styles.userInfo}>
                    <h3>{conn.connectionId.name}</h3>
                    <p>{conn.connectionId.username}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No connection requests</p>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
