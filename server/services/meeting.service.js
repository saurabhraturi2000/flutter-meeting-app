const { meeting } = require("../models/meeting.model");
const { meetingUser } = require("../models/meeting-user.model");

async function getAllMeetingUsers(meetId, callback) {
  meetingUser
    .find({ meetingId: meetId })
    .then((response) => {
      return callback(null, response);
    })
    .catch((err) => {
      return callback(err);
    });
}

async function startMeeting(params, callback) {
  const meetingSchema = new meeting(params);
  meetingSchema
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((err) => {
      return callback(err);
    });
}

async function joinMeeting(params, callback) {
  const meetingUserModel = new meetingUser(params);

  meetingUserModel
    .save()
    .then(async (response) => {
      await meeting.findOneAndUpdate(
        { _id: params.meetingId },
        { $addToSet: { meetingUser: meetingUserModel } }
      );
      return callback(null, response);
    })
    .catch((err) => {
      return callback(err);
    });
}

async function isMeetingPresent(meetingId, callback) {
  meeting
    .findById(meetingId)
    .populate("meetingUsers", "MeetingUser")
    .then((response) => {
      if (!response) callback("Invalid Meeting Id");
      return callback(null, true);
    })
    .catch((err) => {
      return callback(err, false);
    });
}

async function checkMeetingExists(meetingId, callback) {
  meeting
    .findById(meetingId)
    .populate("meetingUsers", "MeetingUser")
    .then((response) => {
      if (!response) callback("Invalid Meeting Id");
      return callback(null, response);
    })
    .catch((err) => {
      return callback(err, false);
    });
}

async function getMeetingUser(params, callback) {
  const { meeting, userId } = params;

  meetingUser
    .find({ meetingId, userId })
    .then((response) => {
      return callback(null, response[0]);
    })
    .catch((err) => {
      return callback(err);
    });
}

async function updateMeetingUser(params, callback) {
  meetingUser
    .updateOne({ userId: params.userId }, { $set: params }, { new: true })
    .then((response) => {
      return callback(null, response);
    })
    .catch((err) => {
      return callback(err);
    });
}

async function getUserBySocketId(params, callback) {
  const { meetingId, socketId } = params;

  meetingUser
    .find({ meetingId, socketId })
    .limit(1)
    .then((response) => {
      return callback(null, response[0]);
    })
    .catch((err) => {
      return callback(err);
    });
}

module.exports = {
  getAllMeetingUsers,
  startMeeting,
  joinMeeting,
  isMeetingPresent,
  checkMeetingExists,
  getMeetingUser,
  updateMeetingUser,
  getUserBySocketId,
};