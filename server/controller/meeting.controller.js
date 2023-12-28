const meetingService = require("../services/meeting.service");

exports.startMeeting = async (req, res, next) => {
  const { hostId, hostName } = req.body;

  var model = {
    hostId,
    hostName,
    startTime: Date.now(),
  };

  meetingService.startMeeting(model, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "success",
      data: results.id,
    });
  });
};

exports.checkMeetingExists = (req, res, next) => {
  const { meetingId } = req.query;

  meetingService.checkMeetingExists(meetingId, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "success",
      data: results,
    });
  });
};

exports.getAllMeetingUsers = (req, res, next) => {
  const { meetingId } = req.body;

  meetingService.getAllMeetingUsers(meetingId, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "success",
      data: results,
    });
  });
};
