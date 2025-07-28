// components/Navbar.tsx
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";

interface NavbarProps {
  onLoginClick: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Pegra Capital</div>
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/"
                className="text-gray-700 hover:text-blue-600"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className="text-gray-700 hover:text-blue-600"
              >
                Buy
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className="text-gray-700 hover:text-blue-600"
              >
                Sell
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/my-assets/"
                className="text-gray-700 hover:text-blue-600"
              >
                My Assets
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              {isLoggedIn ? (
                <NavigationMenuLink
                  href="/account"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Account
                </NavigationMenuLink>
              ) : (
                <NavigationMenuLink
                  href="#"
                  onClick={onLoginClick}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
