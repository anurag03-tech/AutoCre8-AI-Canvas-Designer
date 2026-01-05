import Link from "next/link";
import { Button } from "../ui/button";
import Logo from "../shared/Logo";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-2 px-4 bg-white shadow-sm">
      <Logo></Logo>

      {/* Navigation Links */}
      <nav className="flex gap-6 items-center">
        <Link href="/" className="text-lg hover:text-blue-600 font-medium">
          Home
        </Link>

        <Link href="/auth" className="text-lg hover:text-blue-600 font-medium">
          <Button className="cursor-pointer">Login</Button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
