import clientPromise from "@game/lib/mongodb";
import User from "@game/lib/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@game/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { friendId } = await req.json();
    const userId = session.user.id;

    if (userId === friendId) {
        return NextResponse.json({ message: "You cannot add yourself as a friend" }, { status: 400 });
    }

    try {
        await clientPromise;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!user.sentFriendRequests.includes(friendId)) {
            user.sentFriendRequests.push(friendId);
            await user.save();
        }
        
        if (!friend.receivedFriendRequests.includes(userId)) {
            friend.receivedFriendRequests.push(userId);
            await friend.save();
        }

        return NextResponse.json({ message: "Friend request sent" }, { status: 200 });

    } catch (error) {
        console.error("Error sending friend request:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
} 