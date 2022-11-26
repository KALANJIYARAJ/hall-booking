const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const URL =
  "mongodb+srv://admin:admin123@cluster0.zfkqxf5.mongodb.net/?retryWrites=true&w=majority";

app.use(express.json());

//room
//create
app.post("/room", async (req, res) => {
  try {
    //connect the Database
    const connection = await mongoclient.connect(URL);

    //select the DB
    const db = connection.db("Hotel_Booking");

    const room = await db.collection("rooms").insertOne(req.body);
    //close the connection
    await connection.close();
    rooms = room;
    res.json({ message: "room created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//Booking Room
//create
app.post("/booking/:rId", async (req, res) => {
  try {
    //connect the Database
    const connection = await mongoclient.connect(URL);

    //select the DB
    const db = connection.db("Hotel_Booking");

    const booking = await db.collection("bookings").insertOne(req.body);
    await db
      .collection("bookings")
      .updateOne(
        { _id: booking.insertedId },
        { $set: { room_id: mongodb.ObjectId(req.params.rId) } }
      );
    await connection.close();
    // console.log(booking.insertedId)
    res.json({ message: "Booking Confirm" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//List All Rooms
app.get("/rooms_list", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("Hotel_Booking");
    const rooms_list = await db
      .collection("bookings")
      .aggregate([
        {
          $lookup: {
            from: "rooms",
            localField: "room_id",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: "$result",
        },
        {
          $project: {
            _id: 0,
            RoomName: "$result.room_name",
            Booked_Status: "$booked_status",
            CoustomerName: "$coustomer_name",
            Date: "$date",
            StartTime: "$start_time",
            EndTime: "$end_time",
          },
        },
      ])
      .toArray();

    await connection.close();
    res.json(rooms_list);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//List All customers
app.get("/customers_list", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("Hotel_Booking");
    const customers_list = await db
      .collection("bookings")
      .aggregate([
        {
          $lookup: {
            from: "rooms",
            localField: "room_id",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: "$result",
        },
        {
          $project: {
            _id: 0,
            CoustomerName: "$coustomer_name",
            RoomName: "$result.room_name",
            Date: "$date",
            StartTime: "$start_time",
            EndTime: "$end_time",
          },
        },
      ])
      .toArray();

    await connection.close();
    res.json(customers_list);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(process.env.PORT || 3003);
