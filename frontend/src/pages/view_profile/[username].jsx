import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true); // true = Pending, false = Connected

  // Fetch posts and connection requests
  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
  };

  // Filter posts by user
  useEffect(() => {
    if (!postReducer?.posts?.length || !router.query.username) return;

    const filteredPosts = postReducer.posts.filter(
      (post) => post.userId?.username === router.query.username
    );

    setUserPosts(filteredPosts);
  }, [postReducer?.posts, router.query.username]);

  // Check connection status
  useEffect(() => {
    if (!Array.isArray(authState.connections)) return;

    const connection = authState.connections.find(
      (c) => c.connectionId._id === userProfile.userId._id
    );

    if (connection) {
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(!connection.status_accepted); // true = Pending, false = Connected
    }
  }, [authState.connections, userProfile]);

  useEffect(() => {
    getUserPost();
  }, []);

  if (!userProfile) {
    return <div>User not found</div>;
  }

  console.log("Sending connection to:", userProfile.userId?._id);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt=""
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div className={styles.profileContainer__flex}>
              <div style={{ flex: "0.8" }}>
                {/* User name + username */}
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "gray" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          })
                        );
                        // Optimistically update UI
                        setIsCurrentUserInConnection(true);
                        setIsConnectionNull(true); // Pending

                        // Refresh connections in background
                        dispatch(
                          getConnectionsRequest({
                            token: localStorage.getItem("token"),
                          })
                        );
                      }}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      if (!userProfile?.userId?._id) {
                        alert("User ID is missing, cannot download resume.");
                        return;
                      }

                      try {
                        const response = await clientServer.get(
                          `/user/download_resume?id=${userProfile.userId._id}`
                        );

                        const filePath = response?.data?.outputPath;

                        if (!filePath) {
                          alert("Resume not found.");
                          return;
                        }

                        const link = document.createElement("a");
                        link.href = `${BASE_URL}/${filePath}`;
                        link.download = `${userProfile.userId.username}_resume.pdf`;
                        link.click();
                      } catch (error) {
                        console.error("Error downloading resume:", error);
                        alert("Failed to download resume");
                      }
                    }}
                    style={{all: "unset"}}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{
                        width: "1.5em",
                        height: "1.5em",
                        cursor: "pointer",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </button>
                </div>

                <div style={{ marginTop: "0.8rem" }}>
                  <p>{userProfile.bio}</p>
                </div>
              </div>

              <div style={{ flex: "0.2" }}>
                <h3>Recent Activity</h3>
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "gray" }}>No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Work History Section */}
          <div className="workHistory">
            <h3>Work History</h3>

            <div className={styles.workHistoryContaier}>
              {userProfile.pastWork.map((work, index) => (
                <div key={index} className={styles.workHistoryCard}>
                  <p
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    {work.company} - {work.position}
                  </p>
                  <p>{work.years}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default ViewProfilePage;

export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: {
          username: context.query.username,
        },
      }
    );

    const response = request.data;

    if (!response || !response.profile) {
      return { props: { userProfile: null } };
    }

    return { props: { userProfile: response.profile } };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { props: { userProfile: null } };
  }
}
