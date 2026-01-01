import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import LogoutButton from "@/components/shared/LogoutButton";

const Profile = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {session.user?.name}!
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Your Information
          </h2>
          <div className="flex items-center gap-6">
            {session.user?.image && (
              <Image
                width={80}
                height={80}
                src={session.user.image}
                alt={session.user.name || "User"}
                className="rounded-full border-4 border-gray-100"
              />
            )}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-lg text-gray-900">
                  {session.user?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
