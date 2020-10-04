import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from "../../../models/Admin";
import connectToDatabase from "../../../util/mongodb";

connectToDatabase();

let jwtSecret = process.env.JWT_SECRET;

export default async (req, res) => {
  const { method, body } = req;

  switch (method) {
    case "POST":
      try {
        if (!body.email || !body.password) 
          return res.status(401).json({ errors: [{ message: "Fill form properly, missing parameters." }]});
        
        let admin = await Admin.findOne({ email: body.email })

        if (!admin) return res.status(404).json({ errors: [{ message: 'Email does not exist' }] });

        const isMatch = await bcrypt.compare(body.password, admin.password);

        if (!isMatch) return res.status(400).json({ errors: [{ message: 'Invalid credentials' }] });

        const token = jwt.sign(
          {
            email: admin.email,
            adminId: admin._id.toString(),
          },
          jwtSecret
        );

        res.status(200).json({ admin: {firstName: admin.firstName, lastName: admin.lastName, email: admin.email, type: admin.type, status: admin.status}, message: "Login was successful!", token });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    case "PUT":
      try {
        let admin;
        if (!body.firstName || !body.lastName || !body.email || !body.password || !body.type)
          return res.status(401).json({ errors: [{ message: "Fill form properly, missing parameters." }] });
        
        admin = await Admin.findOne({ email: req.body.email });
        if (admin)
          return res.status(401).json({ errors: [{ message: "Email has already been used, user already exists." }] });
        
        //Encrypt password
        let encryptedPassword;
        const salt = await bcrypt.genSalt(10);

        encryptedPassword = await bcrypt.hash(body.password, salt);

        admin = await Admin({ ...body, status: 'Active', password: encryptedPassword });

        await admin.save();

        res.status(201).json({ message: "Admin created sucessfully. Meet super admin for aprroval", admin });
      } catch (error) {
        res.status(500).json({ error });
      }
      break;
    default:
      res.status(400).json({ message: "BAD REQUEST!" });
      break;
  }
};