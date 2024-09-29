"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Participants() {
  return (
    <main className="bg-black text-white text-4xl font-bold mx-10 my-10 text-center">
      <h1 className="tracking-wide">participants</h1>
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        <Link href="/participants/add">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-52">
            add
          </Button>
        </Link>
        <Link href="/participants/search">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-52">
            search
          </Button>
        </Link>
        <Link href="/participants/update">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-52">
            update
            </Button>
        </Link>
        <Link href="/participants/delete">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-52">
            delete
          </Button>
        </Link>
        <Link href="/participants/all">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-52">
            view all
            </Button>
        </Link>
        <Link href="/">
          <Button className="bg-mid text-white font-bold text-lg border-mid border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
            main menu
            </Button>
        </Link>
      </div>
    </main>
  );
}
