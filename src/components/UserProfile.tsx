import { gql, useQuery } from "@apollo/client";

const GET_USER_DATA = gql`
  query GetUserData {
    me {
      userId
      name
      email
    }
  }
`;

const UserProfile = () => {
  const { loading, error, data } = useQuery(GET_USER_DATA);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Welcome, {data.me.name}!</h2>
      <h2>id, {data.me.userId}</h2>
      <p>Email: {data.me.email}</p>
    </div>
  );
};

export default UserProfile;
