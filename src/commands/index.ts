import chat from "./chat";
import queryMarket from "./queryMarket";
import queryNuke from "./queryNuke";
import queryResource from "./queryResource";
import queryRoom from "./queryRoom";
import queryUser from "./queryUser";

export const commands = [
  queryResource,
  queryMarket,
  queryUser,
  queryNuke,
  queryRoom,
  chat,
];
