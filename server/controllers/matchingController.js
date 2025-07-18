//define functions
/**
 *  List of events and user gets matched to one based on their criteria
 */
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
//returns matched events
const matchEvents = (req, req) => {

    //example 
    const requiredSkills = ["", ""];
    const requiredDate = "2025-07-01";
    const requiredZip = "00000";

    const matches = Volunteer.find({
      skills: { $all: requiredSkills },
      availability: requiredDate,
      "location.zip": requiredZip
    });

     return res.json({
      eventId,
      criteria: { requiredSkills, requiredDate, requiredZip },
      matches
    });
}
exports.assignVolunteers = async (req, res, next) => {
    const eventId = req.params.eventId;
    // Static example IDs
    const volunteerIds = ["64a1f2b3c4d5e6f7a8b9c0d2"];
    const event =  Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.volunteers = volunteerIds;
    event.save();

    await Volunteer.updateMany(
      { _id: { $in: volunteerIds } },
      { $push: { events: event._id } }
    );

    res.json({
      message: 'volunteers assigned',
      eventId,
      assignedVolunteerIds: volunteerIds
    });
 
};