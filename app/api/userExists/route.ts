import { NextResponse } from "next/server";
import User from "@game/lib/models/User";
import clientPromise from "@game/lib/mongodb";
import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();
        const user = await User.findOne({ email }).select("_id");
        return NextResponse.json({ user });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
} 