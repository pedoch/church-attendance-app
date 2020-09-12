import User from "../../../models/User";
import connectToDatabase from "../../../util/mongodb";

connectToDatabase();

export default async (req, res) => {
  const { method, query } = req;

  switch (method) {
    case "GET":
      try {
        const { search } = query;
        let filter;
        if (search) filter = { firstName: search };

        const users = await User.aggregate([
          { $project: { name: { $concat: ["$firstName", " ", "$lastName"] } } },
          { $match: { name: { $regex: search, $options: "i" } } },
        ]);

        res.status(200).json({ users: users, message: "User fetched sucessfully!" });
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
