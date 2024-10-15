"use client";
import { 
  Button,
} from "@/components/ui/button"
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-black text-white text-4xl font-bold mx-10 my-10 text-center">
        <h1 >Newman Tournament App</h1>
        <div className="my-16 flex flex-col items-center justify-center space-y-10">
        <Link href="/participants">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 hover:bg-black hover:text-white transition-colors duration-400 w-40">
            Participants
          </Button>
        </Link>
        <Link href="/events">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
            Events
          </Button>
        </Link>
        <Link href="/leaderboard">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
            Leaderboard
          </Button>
        </Link>
        <Link href="/acivities">
          <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
            Activities
          </Button>
        </Link>
        </div>
    </main>
  );
}
