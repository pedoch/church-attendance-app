import Service from "../../../models/Service";
import connectToDatabase from "../../../util/mongodb";

connectToDatabase();

export default async (req, res) => {
  const { method, body, query } = req;

  switch (method) {
    case "GET":
      try {
        const { date } = query;

        const services = await Service.find({ date }).populate("attendees");

        res.status(200).json({ services: services, message: "Services fetched sucessfully!" });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    default:
      res.status(400).json({ message: "BAD REQUEST!" });
      break;
  }
};
