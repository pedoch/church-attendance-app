import { Button } from "antd";
import Link from "next/link";

function Navbar({ setModalFunc, setRequestModalFunc }) {
  return (
    <div className="py-2 px-4 flex justify-between w-full absolute shadow bg-white">
      <Link href="/">
        <a className="flex items-center">
          <img src="/images/church-Of-God-Mission-international.png" className="w-auto h-8 pr-4" />
          <p className="font-semibold">CGMI Garden City</p>
        </a>
      </Link>
      <div className="flex">
        <div className="flex mr-8">
          <Button type="primary" size="medium" className="mr-3" onClick={() => setModalFunc(true)}>
            Register
          </Button>
          <Button size="medium" onClick={() => setRequestModalFunc(true)}>
            Query Service Attendance
          </Button>
        </div>
        <Button type="primary">Log Out</Button>
      </div>
    </div>
  );
}

export default Navbar;
