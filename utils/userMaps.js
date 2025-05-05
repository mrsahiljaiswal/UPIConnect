const User = require("../models/User");

let idToUsernameMap = {};
let usernameToIdMap = {};

// Populate the user maps asynchronously by fetching users from the database.
const populateUserMaps = async () => {
  const users = await User.find({}, "_id username");
  idToUsernameMap = {};
  usernameToIdMap = {};
  users.forEach(user => {
    idToUsernameMap[user._id.toString()] = user.username;
    usernameToIdMap[user.username] = user._id.toString();
  });
};

// Modified getUsernameFromId to be asynchronous, fetching the username directly if not in the map.
const getUsernameFromId = async (id) => {
  if (idToUsernameMap[id]) {
    return idToUsernameMap[id];
  }
  
  const user = await User.findById(id);
  if (user) {
    idToUsernameMap[id] = user.username;  // Store it in the map for future calls.
    return user.username;
  }
  return null; // If no user found with the given id.
};

// Modify getIdFromUsername to work synchronously since we are not querying DB here.
const getIdFromUsername = (username) => usernameToIdMap[username] || null;

// Update the user maps with a new user (used for dynamically adding users).
const updateUserMap = (id, username) => {
  idToUsernameMap[id] = username;
  usernameToIdMap[username] = id;
};

module.exports = {
  populateUserMaps,
  getUsernameFromId,
  getIdFromUsername,
  updateUserMap
};
