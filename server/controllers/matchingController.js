exports.ismatched = (req, req) =>
{
const volunteers = [
    {
      _id: 'v1',
      name: 'Dorian',
      skills: ['cooking', 'first aid'],
      availability: ['Monday', 'Wednesday'],
      location: 'Houston'
    }
];
const events = [
    {
      _id: 'e1',
      title: 'Community Kitchen',
      requiredSkills: ['cooking'],
      date: 'Monday',
      location: 'Houston'
    },
];
const volunteer = volunteers.find(v => v._id === volunteerId);

if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }

const matchedEvents = events.filter(event => {
    const skillMatch = event.requiredSkills.every(skill =>
        volunteer.skills.includes(skill)
    );
    const availabilityMatch = volunteer.availability.includes(event.date);  
    const locationMatch = event.location === volunteer.location;
    return skillMatch && availabilityMatch && locationMatch;
});


res.status(200).json({
    volunteer: {
      id: volunteer._id,
      name: volunteer.name
    },
    matchedEvents: matchedEvents.map(event => ({
      id: event._id,
      title: event.title,
      date: event.date,
      location: event.location
    }))
  });


};