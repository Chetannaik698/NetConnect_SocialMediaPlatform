import Profile from "../models/profile.model.js";
import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs"; // fs stands for file system
import ConnectionRequest from "../models/connections.model.js";

export const convertUserDataToPdf = (userData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    // Profile Picture (optional)
    if (userData.userId.profilePicture) {
      try {
        doc.image(`uploads/${userData.userId.profilePicture}`, {
          align: "center",
          width: 100,
        });
      } catch (err) {
        console.warn("Image not found or invalid:", err.message);
      }
    }

    // User Info
    doc.fontSize(14).text(`Name: ${userData.userId.name || "N/A"}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username || "N/A"}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email || "N/A"}`);

    // Profile Info
    doc.fontSize(14).text(`Bio: ${userData.bio || "N/A"}`);
    doc.fontSize(14).text(`Current Position: ${userData.currPost || "N/A"}`);

    // Past Work
    doc.fontSize(14).text("Past Work:");
    if (userData.pastWork && userData.pastWork.length > 0) {
      userData.pastWork.forEach((work, index) => {
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Company: ${work.company || "N/A"}`);
        doc.fontSize(12).text(`Position: ${work.position || "N/A"}`);
        doc.fontSize(12).text(`Years: ${work.years || "N/A"}`);
      });
    } else {
      doc.fontSize(12).text("No past work information available.");
    }

    doc.end();

    stream.on("finish", () => {
      resolve(outputPath);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.json({ message: "User Created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are requires" });

    const user = await User.findOne({
      email,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid Credentials");

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token: token, message: "Login successfull" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//upload profile picture
export const uploadProfilPicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) return res.status(404).json({ message: "Usser not found" });

    user.profilePicture = req.file.filename;

    await user.save();

    return res.json({ messgae: "Profile Picture Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    // Find the user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username or email already exist for a different user
    if (newUserData.username || newUserData.email) {
      const existingUser = await User.findOne({
        $or: [
          newUserData.username ? { username: newUserData.username } : {},
          newUserData.email ? { email: newUserData.email } : {},
        ],
      });

      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
    }

    // Update fields
    Object.assign(user, newUserData);
    await user.save();

    return res.json({ message: "User updated successfully ✅" });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });

    if (!user) return res.status(404).json({ message: "Usser not found" });

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    ); //here populate returns the user daata along with the profile

    return res.json({ userProfile });

    return res.json({ messgae: "User Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token: token });

    if (!userProfile) {
      return res.status(404).json({ message: "Usser not found" });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.json({ message: "Profile Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//This is search functanilty it gets all user profiles
export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );

    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture" // remove comma from "name, username"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const outputPath = await convertUserDataToPdf(userProfile);

    return res.json({ outputPath });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body         ;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });

    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found " });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    return res.json({ message: "Request Sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyConnectionsRequests = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.findOne({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.json({ connections });

    return res.json({ messgae: "User Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.findOne({
      connectionId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.json({ connections });

    return res.json({ messgae: "User Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findOne({ _id: requestId });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.json({ message: "Request updated" });

    return res.json({ messgae: "User Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  try {
    const { username } = req.query;

    const user = await User.findOne({ username }); // ✅ added await

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile Not Found" });
    }

    return res.json({ profile: userProfile }); // ✅ consistent lowercase
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

