import User from "../../../models/User";
import connectToDatabase from "../../../util/mongodb";

connectToDatabase();

export default async (req, res) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const users = await User.find();

        res.status(200).json({ users: users, message: "User fetched sucessfully!" });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error });
      }
      break;
    case "POST":
      try {
        const user = await User.create(req.body);

        res.status(201).json({ message: "User created sucessfully", user: user });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error });
      }
      break;
    default:
      res.status(400).json({ message: "BAD REQUEST!" });
      break;
  }
};
