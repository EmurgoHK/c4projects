import { Meteor } from "meteor/meteor";

import { Notifications } from "../notifications";

Meteor.publish("notifications", () => 
  Notifications.find({userId: Meteor.userId()})
);
