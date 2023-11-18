const express = require("express");
const router = express.Router();
const client = require("../database/db");
const { ObjectId } = require("mongodb");

const usersCollection = client.db("NeighborServe").collection("UsersData");

router.get("/api/:id/:category", async (req, res) => {
  const id = req.params.id; // Use req.params.id to get the id from route parameters
  const category = req.params.category;
  const type = "Service Provider";
  const filter = { user_category: category, user_type: type };
  const result = await usersCollection.find(filter).toArray();
  const filter2 = { _id: new ObjectId(id) };
  const document = await usersCollection.find(filter2).toArray();
  const userLat = document[0].user_lat;
  const userLon = document[0].user_lon;

  // haversine algorithm to calculate distances between 2 coordinates
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
    const dlon = lon2Rad - lon1Rad;
    const dlat = lat2Rad - lat1Rad;

    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    // console.log("distance: " + distance);
    return distance;
  }

  const dataArrayUpdated = result.map((place) => {
    const distance = haversine(
      userLat,
      userLon,
      place.user_lat,
      place.user_lon
    );
    return { ...place, distance };
  });

  // Sort the dataArrayWithDistances by distance in ascending order
  dataArrayUpdated.sort((a, b) => a.distance - b.distance);

  // dataArrayUpdated.slice(0, 5).map((data)=>{
  //   const newData=data;
  // })
  // const modifiedArray = dataArrayUpdated.slice(0, 5).map((data) => {});
  const dataArrayUpdatedArray = [...dataArrayUpdated];
  const firstFiveElements = dataArrayUpdatedArray.slice(0, 3);
  
  res.send(firstFiveElements);
});

router.get("/providers/:id/:category", async (req, res) => {
  const id = req.params.id; // Use req.params.id to get the id from route parameters
  const category = req.params.category;
  const type = "Service Provider";
  const filter = { user_category: category, user_type: type };
  const result = await usersCollection.find(filter).toArray();
  const filter2 = { _id: new ObjectId(id) };
  const document = await usersCollection.find(filter2).toArray();
  const userLat = document[0].user_lat;
  const userLon = document[0].user_lon;

  // haversine algorithm to calculate distances between 2 coordinates
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
    const dlon = lon2Rad - lon1Rad;
    const dlat = lat2Rad - lat1Rad;

    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    // console.log("distance: " + distance);
    return distance;
  }

  const dataArrayUpdated = result.map((place) => {
    const distance = haversine(
      userLat,
      userLon,
      place.user_lat,
      place.user_lon
    );
    return { ...place, distance };
  });

  // Sort the dataArrayWithDistances by distance in ascending order
  dataArrayUpdated.sort((a, b) => a.distance - b.distance);

  res.send(dataArrayUpdated);
});

router.get("/getId/:userEmail", async (req, res) => {
  const email = req.params.userEmail;
  const filter = { user_email: email };
  const result = await usersCollection.find(filter).toArray();
  res.send(result);
});

router.get("/providersProfile", async (req, res) => {
  const id = req.query.id;
  const filter = { _id: new ObjectId(id) };
  const result = await usersCollection.find(filter).toArray();
  res.send(result);
});

router.patch("/update_location/:userId", async (req, res) => {
  const id = req.params.userId;
  const { user_lat, user_lon, user_location } = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      user_lat,
      user_lon,
      user_location,
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});


router.patch("/verification/:userId", async (req, res) => {
  const id = req.params.userId;
  const { user_phone, user_verificationStatus } = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      user_phone, user_verificationStatus
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});



router.get("/appointment", async (req, res) => {
  const userId = req.query.id;
  const filter = { _id: new ObjectId(userId) };
  const userDocument = await usersCollection.findOne(filter);

  if (!userDocument) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const appointments = userDocument.appointments || [];

  // Create an array of all possible time slots you want to consider
  const allTimeSlots = [
    "Choose a time slot",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ];

  // Get the current time
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Iterate through the appointments and remove already appointed time slots
  for (const appointment of appointments) {
    const appointmentTime = appointment.appointmentTime;
    const [hour, minutes] = appointmentTime.split(":");
    const appointmentHour = parseInt(hour, 10);
    const appointmentMinutes = parseInt(minutes, 10);

    if (
      appointmentHour < currentHour ||
      (appointmentHour === currentHour && appointmentMinutes <= currentMinutes)
    ) {
      // If the appointment has already passed, remove it from available time slots
      const index = allTimeSlots.indexOf(appointmentTime);
      if (index !== -1) {
        allTimeSlots.splice(index, 1);
      }
    }
  }

  res.json({ availableTimeSlots: allTimeSlots });
});

router.post("/create-appointment/:userId", async (req, res) => {
  const id = req.params.userId;
  const newappointmentData = req.body;

  try {
    const result1 = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          appointments: newappointmentData,
        },
      }
    );

    if (result1.modifiedCount === 1) {
      // The update for the first user was successful

      // Now, update the second user (assuming user_id is a string)
      const secondUserId = newappointmentData.user_id;

      const result2 = await usersCollection.updateOne(
        { _id: new ObjectId(secondUserId) },
        {
          $push: {
            appointments: newappointmentData,
          },
        }
      );

      if (result2.modifiedCount === 1) {
        // The update for the second user was successful
        res.status(200).json({ message: "appointments added successfully" });
      } else {
        // No document was matched for the second update
        res.status(404).json({ error: "Second user not found" });
      }
    } else {
      // No document was matched for the first update
      res.status(404).json({ error: "First user not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error adding appointments" });
  }
});

router.get("/view_appointment/:userId", async (req, res) => {
  const id = req.params.userId;
  const filter = { _id: new ObjectId(id) };
  const result = await usersCollection.find(filter).toArray();

  if (result.length > 0) {
    const appointments = result[0].appointments;
    res.json({ appointments });
  } else {
    // Handle the case when the user is not found
    res.status(404).json({ error: "User not found" });
  }
});

router.get("/appointment_details/:userId/:appointmentId", async (req, res) => {
  const userId = req.params.userId;
  const appointmentId = req.params.appointmentId;

  try {
    // Assuming your appointments are stored as an array of objects in your user document
    const filter = { _id: new ObjectId(userId) };
    const user = await usersCollection.findOne(filter);

    if (user) {
      const appointment = user.appointments.find(
        (appointment) => appointment.appointmentId === appointmentId
      );

      if (appointment) {
        res.status(200).json(appointment);
      } else {
        res.status(404).json({ error: "appointment not found" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching appointment" });
  }
});

router.delete(
  "/cancel_appointment/:userId/:appointmentId",
  async (req, res) => {
    const userId = req.params.userId;
    const appointmentId = req.params.appointmentId;
    const filter = { _id: new ObjectId(userId) };
    const update = {
      $pull: { appointments: { appointmentId: appointmentId } },
    };

    try {
      const document = await usersCollection.findOne(filter);

      if (document) {
        const appointments = document.appointments;
        const appointment = appointments.find(
          (router) => router.appointmentId === appointmentId
        );

        if (appointment) {
          const userId2 = appointment.pro_id;

          const filter2 = { _id: new ObjectId(userId2) };
          const update2 = {
            $pull: { appointments: { appointmentId: appointmentId } },
          };
          const result = await usersCollection.updateOne(filter, update);
          const result2 = await usersCollection.updateOne(filter2, update2);
        } else {
          res.status(404).json({ error: "appointment not found" });
        }
      } else {
        res.status(404).json({ error: "User not found" });
      }

      // Send a success response or other routerropriate response here
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
);

module.exports = router;
