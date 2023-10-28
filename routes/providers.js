const express = require("express");
const router = express.Router();
const client = require("../database/db");
const { ObjectId } = require("mongodb");

const usersCollection = client.db("NeighborServe").collection("UsersData");

router.get("/providers", async (req, res) => {
  const category = req.query.category;
  const filter = { user_category: category };
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
  // console.log(id);
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

  // Iterate through the appointments and remove already routerointed time slots
  for (const appointment of appointments) {
    const appointmentTime = appointment.appointmentTime;

    if (allTimeSlots.includes(appointmentTime)) {
      // If the appointment time exists in allTimeSlots, remove it
      allTimeSlots.splice(allTimeSlots.indexOf(appointmentTime), 1);
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

router.get(
  "/appointment_details/:userId/:appointmentId",
  async (req, res) => {
    const userId = req.params.userId;
    const appointmentId = req.params.appointmentId;

    try {
      // Assuming your appointments are stored as an array of objects in your user document
      const filter = { _id: new ObjectId(userId) };
      const user = await usersCollection.findOne(filter);

      if (user) {
        const appointment = user.appointments.find(
          (appointment) =>
            appointment.appointmentId === appointmentId
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
  }
);

router.delete(
  "/cancel_appointment/:userId/:appointmentId",
  async (req, res) => {
    const userId = req.params.userId;
    const appointmentId = req.params.appointmentId;
    console.log("userId:", userId);
    console.log("appointmentId:", appointmentId);

    const filter = { _id: new ObjectId(userId) };
    const update = {
      $pull: { appointments: { appointmentId: appointmentId } },
    };

    try {
      const document = await usersCollection.findOne(filter);
      console.log("Document:", document);

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
