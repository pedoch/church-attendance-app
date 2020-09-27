import Link from "next/link";

function Navbar() {
  return (
    <div className="py-2 px-4 flex justify-between w-screen absolute">
      <Link href="/">
        <a className="flex items-center">
          <img src="/images/church-Of-God-Mission-international.png" className="w-auto h-8 pr-4" />
          <p className="font-semibold">CGMI Garden City</p>
        </a>
      </Link>
    </div>
  );
}

export default Navbar;
