import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserFromRequestContext } from "~/services/session";
import { getUserByUsername } from "~/services/user";
import { invariantResponse } from "~/util/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariantResponse(params.username, "Expected params.username");

  const loggedInUser = await getUserFromRequestContext(request);
  const profileUser = await getUserByUsername(params.username);

  return json({
    loggedInUser: {
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    },
    user: { username: profileUser.username, email: profileUser.email },
  });
};

export default function ProfileRoute() {
  const { loggedInUser, user } = useLoaderData<typeof loader>();

  return (
    <div>
      <section>
        <h2 className="text-xl">Person who you&pos;re viewing</h2>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
      </section>
      <section>
        <h2 className="text-xl">You</h2>
        <p>Username: {loggedInUser.username}</p>
        <p>Email: {loggedInUser.email}</p>
      </section>
      <section>
        <h2 className="text-xl">
          Are you the user whose profile we&pos;re viewing?
        </h2>
        <p
          className={
            loggedInUser.username === user.username
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {loggedInUser.username === user.username ? "Yes" : "No"}
        </p>
      </section>
    </div>
  );
}
