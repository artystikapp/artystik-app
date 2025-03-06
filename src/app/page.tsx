import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  // Get the userId from auth() -- if null, the user is not signed in
  const { userId } = await auth();

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return <div>Sign in to view this page</div>;
  }

  // Get the Backend API User object when you need access to the user's information
  const user = await currentUser();

  if (!user) {
    return <div>Please complete your profile</div>;
  }

  // Use `user` to render user details or create UI elements
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Welcome, {user.firstName}!</h1>
      <div className="flex flex-col mt-8">
        <p className="text-lg">Email: {user.emailAddresses[0].emailAddress}</p>
        <p className="text-lg">First Name: {user.firstName}</p>
        <p className="text-lg">Last Name: {user.lastName}</p>
      </div>
    </div>
  );
}
