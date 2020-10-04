import axios from "axios";
import dayJS from "dayjs";
import User from "../../../models/User";
import connectToDatabase from "../../../util/mongodb";

connectToDatabase();

export default async (req, res) => {
  const { method, body } = req;

  switch (method) {
    case "GET":
      try {
        const users = await User.find();

        res.status(200).json({ users: users, message: "User fetched sucessfully!" });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    case "POST":
      try {
        let user;
        if (!req.body.firstName || !req.body.lastName || !req.body.phone)
          return res.status(401).json({ message: "Fill form properly, missing parameters." });

        if (req.body.email) {
          user = await User.findOne({ email: req.body.email });
          if (user)
            return res
              .status(401)
              .json({ message: "Email has already been used, user already exists." });
        }

        user = await User.findOne({ phone: req.body.phone });

        if (user)
          return res
            .status(401)
            .json({ message: "Phone number has already been used, user already exists." });

        user = await User({ ...body });

        await user.save();

        await axios.post("https://cgmi-vi-attendance.vercel.app/api/services", {
          attendees: [user._id],
          date: dayJS().format("MM-DD-YYYY"),
          type: body.service,
        });

        res.status(201).json({ message: "User created sucessfully", user: user });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    default:
      res.status(400).json({ message: "BAD REQUEST!" });
      break;
  }
};
