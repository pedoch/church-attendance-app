import dayJs from "dayjs";
import isAuth from '../../../middleware/is-auth';
import Service from "../../../models/Service";
import User from "../../../models/User";
import connectToDatabase from "../../../util/mongodb";

connectToDatabase();

const dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async (req, res) => {
  const { method, body, query } = req;

  if(isAuth(req, res) === true) switch (method) {
    case "GET":
      try {
        const { date, id } = query;
        let filter;
        if (date && !id) filter = { date };
        if (id && !date) filter = { _id: id };

        const services = await Service.find(filter).populate("attendees");

        res.status(200).json({ services: services, message: "Services fetched sucessfully!" });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    case "POST":
      try {
        const { date, attendees, type } = body;

        const notification = [];

        let service = await Service.findOne({ date, type });

        if (!service) {
          const day = dayJs(date).day();
          const dateFormated = dayJs(date).format("DD-MM-YYYY");
          service = await Service.create({
            name: `${dayArray[day]} Service - ${dateFormated}`,
            date,
            type,
            attendees: [],
          });
        }
        for (let i = 0; i < attendees.length; i++) {
          const user = await User.findById(attendees[i]);
          if (user) {
            if (service.attendees.find((att) => String(att) == String(user._id))) {
              notification.push({
                message: `${user.firstName} ${user.lastName} already present.`,
                success: false,
              });
            } else {
              service.attendees.push(user._id);
              notification.push({
                message: `${user.firstName} ${user.lastName} marked present.`,
                success: true,
              });
            }
          }
        }

        await Service.findByIdAndUpdate(service._id, service);

        res.status(201).json({ message: "Service updated sucessfully", service, notification });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    default:
      res.status(400).json({ message: "BAD REQUEST!" });
      break;
  }
};
