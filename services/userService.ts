import User from "../models/userModel.ts";
import type {
  NewUser,
  UserDocument,
  UpdateUser,
  GoogleProfile,
  GithubProfile,
} from "../types.ts";
import { hashPassword } from "../utils/auth.ts";

const addUser = async (
  newUser: NewUser,
  authProvider = "local",
): Promise<UserDocument> => {
  const { username, email, password } = newUser;
  const hash = await hashPassword(password);
  const user = await new User({
    username,
    email,
    password: hash,
    authProvider,
  }).save();
  return user;
};
const updateUser = async (
  updateUser: UpdateUser,
): Promise<UserDocument | null> => {
  const { id, image, username } = updateUser;
  const user = await User.findById(id).orFail();

  if (image !== undefined) user.image = image;
  if (username !== undefined) user.username = username;

  return user.save();
};

const findByEmail = async (email: string): Promise<UserDocument | null> => {
  return User.findOne({ email: email });
};
const findById = async (id: string): Promise<UserDocument | null> => {
  return User.findById(id);
};
const findByUsername = async (
  username: string,
): Promise<UserDocument | null> => {
  return User.findOne({ username: username });
};
const updateRefreshToken = async ({
  id,
  refreshToken,
}: {
  id: string;
  refreshToken: string;
}) => {
  return User.findByIdAndUpdate(id, { refreshToken });
};
const insertUsers = async (users: NewUser[]) => User.insertMany(users);
const dropUsers = async () => await User.deleteMany({});
const addFromGoogleProfile = (profile: GoogleProfile) => {
  return User.findOneAndUpdate(
    { googleId: profile.id },
    {
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails?.[0].value,
      image: profile.photos?.[0].value,
      authProvider: "google",
    },
    { upsert: true, returnDocument: "after" },
  );
};
const addFromGithubProfile = (profile: GithubProfile) => {
  return User.findOneAndUpdate(
    { githubId: profile.id },
    {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails?.[0].value,
      image: profile.photos?.[0].value,
      authProvider: "github",
    },
    { upsert: true, returnDocument: "after" },
  );
};
export default {
  addUser,
  updateUser,
  dropUsers,
  findByEmail,
  findById,
  findByUsername,
  updateRefreshToken,
  insertUsers,
  addFromGoogleProfile,
  addFromGithubProfile,
};
