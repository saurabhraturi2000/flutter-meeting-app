const { Meeting } = require("../models/meeting.model");
const meetingServices = require("../services/meeting.service");
const { MeetingPayLoadEnum } = require("./meeting-payload.enum");

async function joinMeeting(meetingId, socket, meetingServer, payload) {
  const { userId, name } = payload.data;
  meetingServices.isMeetingPresent(meetingId, async (error, results) => {
    if (error && !results) {
      sendMessage(socket, {
        type: MeetingPayLoadEnum.NOT_FOUND,
      });
    }

    if (results) {
      addUser(socket, { meetingId, userId, name }).then(
        (results) => {
          if (results) {
            sendMessage(socket, {
              type: MeetingPayLoadEnum.JOINED_MEETING,
              data: {
                userId,
              },
            });

            broadcastUsers(meetingId, socket, meetingServer, {
              type: MeetingPayLoadEnum.USER_JOINED,
              data: {
                userId,
                name,
                ...payload.data,
              },
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  });
}

function forwardConnectionRequest(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, name } = payload.data;

  var model = {
    meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPayLoadEnum.CONNECTION_REQUEST,
        data: {
          userId,
          name,
          ...payload.data,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}
function forwardIceCandidate(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, candidate } = payload.data;

  var model = {
    meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPayLoadEnum.ICECANDIDATE,
        data: {
          userId,
          candidate,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}
function forwardOfferSDP(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, sdp } = payload.data;

  var model = {
    meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPayLoadEnum.OFFER_SDP,
        data: {
          userId,
          sdp,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}
function forwardAnswerSDP(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, sdp } = payload.data;

  var model = {
    meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPayLoadEnum.ANSWER_SDP,
        data: {
          userId,
          sdp,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}
function userLeft(meetingId, socket, meetingServer, payload) {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: MeetingPayLoadEnum.USER_LEFT,
    data: {
      userId,
    },
  });
}
function endMeeting(meetingId, socket, meetingServer, payload) {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: MeetingPayLoadEnum.MEETING_ENDED,
    data: {
      userId,
    },
  });

  meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
    for (let i = 0; i < results.length; i++) {
      const meetingUser = results[i];
      meetingServer.sockets.connected[meetingUser.socketId].disconnect();
    }
  });
}

function forwardEvent(meetingId, socket, meetingServer, payload) {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: payload.type,
    data: {
      userId,
      ...payload.data,
    },
  });
}
function addUser(socket, { meetingId, userId, name }) {
  let promise = new Promise((resolve, reject) => {
    meetingServices.addUser(userId, name, meetingId, (error, results) => {
      if (!results) {
        var model = {
          socketId: socket.id,
          meetingId,
          userId,
          joined: true,
          name,
          isAlive: true,
        };

        meetingServices.joinMeeting(model, (error, results) => {
          if (error) {
            reject(error);
          }

          if (results) {
            resolve(results);
          }
        });
      } else {
        meetingServices.updateMeetingUser(
          { userId, socketId: socket.id },
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (results) {
              resolve(true);
            }
          }
        );
      }
    });
  });
  return promise;
}

function sendMessage(socket, payload) {
  socket.send(JSON.stringify(payload));
}

function broadcastUsers(meetingId, socket, meetingServer, payload) {
  socket.broadcast.emit("message", JSON.stringify(payload));
}

module.exports = {
  joinMeeting,
  forwardConnectionRequest,
  forwardIceCandidate,
  forwardOfferSDP,
  forwardAnswerSDP,
  userLeft,
  endMeeting,
  forwardEvent,
};
