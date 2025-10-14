import { getAboutUser } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL, clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.posts);
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    setUserProfile(authState.user);
  }, [authState.user]);

  useEffect(() => {
    if (!postReducer?.posts?.length || !authState.user?.userId?.username)
      return;

    const filteredPosts = postReducer.posts.filter(
      (post) => post.userId?.username === authState.user?.userId?.username
    );

    console.log("Filtered Post", filteredPosts);

    setUserPosts(filteredPosts);
  }, [postReducer?.posts, authState.user?.userId?.username]);

  const updateprofilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateProfileData = async () => {
    try {
      await clientServer.post("/user_update", {
        token: localStorage.getItem("token"),
        name: userProfile.userId.name,
      });

      await clientServer.post("/update_profile_data", {
        token: localStorage.getItem("token"),
        bio: userProfile.bio,
        currentPost: [userProfile.currentPost],
        pastWork: userProfile.pastWork,
        education: userProfile.education,
      });

      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      alert("Profile updated successfully ✅");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile ❌");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile?.userId && (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <label
                className={styles.backDrop__overlay}
                htmlFor="profilePictureUpload"
              >
                <p>Edit</p>
              </label>
              <input
                hidden
                type="file"
                id="profilePictureUpload"
                onChange={(e) => {
                  updateprofilePicture(e.target.files[0]);
                }}
              />
              <img
                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                alt="Profile backdrop"
              />
            </div>

            <div className={styles.profileContainer_details}>
               <div className={styles.profileContainer__flex}>
                <div style={{ flex: "0.8" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "fit-content",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <input
                      type="text"
                      className={styles.nameEdit}
                      value={userProfile.userId.name}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        })
                      }
                    />

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
                  ></div>

                  <div style={{ marginTop: "0.8rem" }}>
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => {
                        setUserProfile({ ...userProfile, bio: e.target.value });
                      }}
                      rows={Math.max(3, Math.ceil(userProfile.bio.length / 80))}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div style={{ flex: "0.2" }}>
                  <h3>Recent Activity</h3>
                  {userPosts && userPosts.length > 0 ? (
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

            <div className="workHistory">
              <h3>Work History</h3>
              <div className={styles.workHistoryContaier}>
                {userProfile?.pastWork?.length > 0 ? (
                  userProfile.pastWork.map((work, index) => (
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
                  ))
                ) : (
                  <p style={{ color: "gray" }}>No work history available</p>
                )}
              </div>
              <button
                className={styles.addWorkButton}
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                Add Work
              </button>
            </div>

            {userProfile != authState.user && (
              <div
                className={styles.updateProfiledata}
                onClick={() => {
                  updateProfileData();
                }}
              >
                Update Profile
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div
            className={styles.commentsContainer}
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            <div
              className={styles.allcommentsContainer}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                type="text"
                placeholder="Enter Company"
                className={styles.inputField}
                onChange={handleInputChange}
                name="company"
              />
              <input
                type="text"
                placeholder="Enter Position"
                className={styles.inputField}
                onChange={handleInputChange}
                name="position"
              />
              <input
                type="number"
                placeholder="Years"
                className={styles.inputField}
                onChange={handleInputChange}
                name="years"
              />

              <div
                className={styles.updateProfiledata}
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    pastWork: [...userProfile.pastWork, inputData],
                  });
                  setIsModalOpen(false);
                }}
              >
                Add Work
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
