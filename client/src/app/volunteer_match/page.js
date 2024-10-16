"use client"

import Image from "next/image";
import waterbg from '../../public/waterbg.png';
import { useState } from "react"; // Add this to manage state
import { useAuth } from "@/hooks/auth"; // authenticator 

export default function VolunteerMatchForm()  {
  const { isAuthenticated, user, isLoading } = useAuth('administrator'); // Only admins can access
  const [matches, setMatches] = useState([]); // State to store matched volunteers
  const [selectedVolunteers, setSelectedVolunteers] = useState([]); // State to store selected volunteers for assignment
  const [assignedVolunteers, setAssignedVolunteers] = useState([]); // Store assigned volunteers
  const [skills, setSkills] = useState(""); // State for skills input
  const [city, setCity] = useState(""); // State for city input
  const [state, setState] = useState(""); // State for state input
  const [zipcode, setZipcode] = useState(""); // State for zipcode input
  const [availability, setAvailability] = useState(""); // State for availability input
  const [userNotFound, setUserNotFound] = useState(false); // State to track if no volunteers are found



  const token = localStorage.getItem('token'); // Get token from localStorage or use cookies if needed
  console.log("stored token", token);

  // Handle selecting/deselecting volunteers
  const handleVolunteerSelection = (volunteer) => {
    setSelectedVolunteers(prevSelected =>
      prevSelected.includes(volunteer)
        ? prevSelected.filter(v => v !== volunteer) // Deselect if already selected
        : [...prevSelected, volunteer] // Add if not selected
    );
  };

  // Fetch matching data from backend when the "Find Matches" button is clicked
  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/volunteers/match', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, city, state, zipcode, availability }) // Send event details to backend
      });

      const data = await response.json();
      setMatches(data.matches);  // Update the state with matched volunteers
      setUserNotFound(data.matches.length === 0);  // If no matches, set userNotFound to true
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const notifications = []; // Array to store notifications (or move this to a more permanent storage)

  const assignVolunteers = async () => {
      const eventDetails = {
          skills,
          city,
          state,
          zipcode,
          availability,
      };

      const newAssignments = selectedVolunteers.filter(volunteer => {
          return !assignedVolunteers.some(assigned => {
              if (!assigned.volunteer || !assigned.event) return false;

              return assigned.volunteer.fullName === volunteer.fullName &&
                  assigned.event.skills === skills &&
                  assigned.event.city === city &&
                  assigned.event.state === state &&
                  assigned.event.zipcode === zipcode &&
                  assigned.event.availability === availability;
          });
      });

      if (newAssignments.length === 0) {
          console.log("No new volunteers to assign.");
          return;
      }

      try {
          const response = await fetch('http://localhost:8080/api/assignments/assign', {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eventDetails, volunteers: newAssignments })
          });

          const data = await response.json();
          console.log('Assignment Response:', data);

          // Update assigned volunteers in the frontend
          setAssignedVolunteers(prevAssigned => [...prevAssigned, ...newAssignments]);

          // Create notifications for each assigned volunteer
          newAssignments.forEach(volunteer => {
              notifications.push({
                  userId: volunteer.id,  // Assume volunteer has an ID
                  message: `You have been assigned to the ${eventDetails.skills} event on ${eventDetails.availability}.`,
                  isRead: false,
                  date: new Date().toISOString()
              });
          });

          console.log("Notifications: ", notifications);

          setSelectedVolunteers([]);  // Clear selected volunteers

      } catch (error) {
          console.error('Error assigning volunteers:', error);
      }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated || !user) {
    return null; // Redirect handled in the hook
  }

  return (
    <> 
      <div className="flex h-screen">
        {/* left and center 2/3 page */}
        <div className="w-2/3 p-4 bg-cover bg-center relative flex items-center justify-center text-center" style = {{backgroundImage: `url(${waterbg.src})`}}>
          <div className="flex flex-col items-center">
            <h1 className="text-center text-3xl mb-20 font-geistMono" style={{ color: '#423D38' }}>Volunteer Matching</h1>
            
            <form className="w-full max-w-md flex flex-col items-center">
            <select
              className="w-full bg-transparent border-b-2 border-[#423D38] py-2 px-3 mb-4 focus:border-gray-500 focus:outline-none font-geistMono"
              style={{ color: '#423D38' }}
              value={skills} // Set the selected skill
              onChange={(e) => setSkills(e.target.value)} // Update selected skill
              aria-label="Skills Required"
            >
              <option value="">Select Skills</option>
              <option value="Research Skills">Research Skills</option>
              <option value="Communication Skills">Communication Skills</option>
              <option value="Teamwork">Teamwork</option>
              <option value="Physical Fitness">Physical Fitness</option>
              <option value="Botanical Knowledge">Botanical Knowledge</option>
              <option value="Knowledge of Marine Biology">Knowledge of Marine Biology</option>
              <option value="Project Management">Project Management</option>
              <option value="Advocacy and Policy Work">Advocacy and Policy Work</option>
              <option value="Fundraising Skills">Fundraising Skills</option>
              <option value="Diving Skills">Diving Skills</option>
            </select>

              <input
                className="w-full bg-transparent border-b-2 border-[#423D38] py-2 px-3 mb-4 focus:border-gray-500 focus:outline-none font-geistMono"
                style={{ color: '#423D38' }}
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)} // Update city
                aria-label="City"
              />

              <input
                className="w-full bg-transparent border-b-2 border-[#423D38] py-2 px-3 mb-4 focus:border-gray-500 focus:outline-none font-geistMono"
                style={{ color: '#423D38' }}
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)} // Update state
                aria-label="State"
              />

              <input
                className="w-full bg-transparent border-b-2 border-[#423D38] py-2 px-3 mb-4 focus:border-gray-500 focus:outline-none font-geistMono"
                style={{ color: '#423D38' }}
                type="text"
                placeholder="Zipcode"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)} // Update zipcode
                aria-label="Zipcode"
              />

              <input
                className="w-full bg-transparent border-b-2 border-[#423D38] py-2 px-3 mb-4 focus:border-gray-500 focus:outline-none font-geistMono"
                style={{ color: '#423D38' }}
                type="text"
                placeholder="Availability (e.g. 2024-01-01)"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)} // Update availability
                aria-label="Availability"
              />

              {/* Display matched volunteers with checkboxes */}
              {matches.length > 0 && !userNotFound && (
                <div className="mt-4">
                  <h2 className="text-lg mb-2 font-geistMono" style={{ color: '#423D38' }}>Matched Volunteers:</h2>
                  <ul>
                    {matches.map((volunteer, index) => {
                      const isAssigned = assignedVolunteers.some(assigned => {
                          if (!assigned.volunteer || !assigned.event) {
                            return false;
                          }

                          return (
                            assigned.volunteer.fullName === volunteer.fullName &&
                            assigned.event.skills === skills &&
                            assigned.event.city === city &&
                            assigned.event.state === state &&
                            assigned.event.zipcode === zipcode &&
                            assigned.event.availability === availability
                          );
                      });

                      return (
                        <li key={index} className="font-geistMono" style={{ color: '#423D38' }}>
                          {isAssigned ? (
                            <span>Already assigned</span> // Show a message instead of checkbox if already assigned
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedVolunteers.includes(volunteer)}
                              onChange={() => handleVolunteerSelection(volunteer)}
                            />
                          )}
                          {volunteer.fullName} - {volunteer.skills}, {volunteer.city}, {volunteer.state}, {volunteer.zipcode}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Display 'No volunteers found' message */}
              {userNotFound && (
                <p className="text-red-500 mt-4">No volunteers found</p>
              )}
            </form>

            {/* Button to trigger matching */}
            <button
              className="bg-[#423D38] hover:bg-[#B4C4C4] font-bold py-2 px-4 rounded-full mt-10 font-geistMono"
              style={{ color: '#FFFFFF' }}
              type="button"
              onClick={fetchMatches}  // Fetch matches on button click
            >
              Find Matches
            </button>

            {/* Button to assign selected volunteers */}
            {selectedVolunteers.length > 0 && (
              <button
                className="bg-[#423D38] hover:bg-[#B4C4C4] font-bold py-2 px-4 rounded-full mt-10 font-geistMono"
                style={{ color: '#FFFFFF' }}
                type="button"
                onClick={assignVolunteers}  // Assign selected volunteers
              >
                Assign Volunteers
              </button>
            )}

            {/* Display assigned volunteers */}
            {assignedVolunteers.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg mb-2 font-geistMono" style={{ color: '#423D38' }}>Assigned Volunteers:</h2>
                <ul>
                  {assignedVolunteers.map((volunteer, index) => (
                    <li key={index} className="font-geistMono" style={{ color: '#423D38' }}>
                      {volunteer.fullName} - {volunteer.skills}, {volunteer.city}, {volunteer.state}, {volunteer.zipcode}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* right side 1/3 page */}
        <div className="w-1/3 bg-white p-4 flex items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-center text-2xl mb-20 font-geistMono" style={{ color: '#423D38' }}>Tailored Volunteer Matches</h1>
            <p className="text-center text-lg mt-10 font-geistMono" style={{ color: '#423D38' }}>View and match volunteers <br /> to specifically chosen <br />events based on the<br /> individual’s profiles and <br />event requirement.</p>
          </div>
        </div>
      </div>
    </>
  );
}
