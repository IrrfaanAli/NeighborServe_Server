const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb://${process.env.USER_NAME}:${process.env.USER_PASS}@ac-o9yzcgk-shard-00-00.ymwhs5q.mongodb.net:27017,ac-o9yzcgk-shard-00-01.ymwhs5q.mongodb.net:27017,ac-o9yzcgk-shard-00-02.ymwhs5q.mongodb.net:27017/?ssl=true&replicaSet=atlas-xges0x-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("NeighborServe").collection("User1");

    app.get("/users", async (req, res) => {
      const category = req.query.category;
      const filter = { user_category: category };
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/usersProfile", async (req, res) => {
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    app.patch("/update_location/:userId", async (req, res) => {
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

    // app.get("/appointment", async (req, res) => {
    //   const id = req.query.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const result = await usersCollection.find(filter).toArray();
    //   const slots = {
    //     today_slots: result[0].today_slots,
    //     tomorrow_slots: result[0].tomorrow_slots,
    //   };
    //   res.send(slots);
    //   // res.send("Hello: "+id)
    // });

    app.get("/appointment", async (req, res) => {
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

      // Iterate through the appointments and remove already appointed time slots
      for (const appointment of appointments) {
        const appointmentTime = appointment.appointmentTime;

        if (allTimeSlots.includes(appointmentTime)) {
          // If the appointment time exists in allTimeSlots, remove it
          allTimeSlots.splice(allTimeSlots.indexOf(appointmentTime), 1);
        }
      }

      res.json({ availableTimeSlots: allTimeSlots });
    });

    app.get("/view_appointment/:userId", async (req, res) => {
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
    app.get("/appointment_details/:userId/:appointmentId", async (req, res) => {
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
            res.status(404).json({ error: "Appointment not found" });
          }
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error fetching appointment" });
      }
    });

    app.post("/create-appointment/:userId", async (req, res) => {
      const id = req.params.userId;
      const newAppointmentData = req.body;

      try {
        const result1 = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $push: {
              appointments: newAppointmentData,
            },
          }
        );

        if (result1.modifiedCount === 1) {
          // The update for the first user was successful

          // Now, update the second user (assuming user_id is a string)
          const secondUserId = newAppointmentData.user_id;

          const result2 = await usersCollection.updateOne(
            { _id: new ObjectId(secondUserId) },
            {
              $push: {
                appointments: newAppointmentData,
              },
            }
          );

          if (result2.modifiedCount === 1) {
            // The update for the second user was successful
            res
              .status(200)
              .json({ message: "Appointments added successfully" });
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

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log("hello.....");
});
