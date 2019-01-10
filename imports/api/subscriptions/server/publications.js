import { Meteor } from "meteor/meteor";
import { Subscriptions } from "../subscriptions";

Meteor.publish("subscriptions.my", () => Subscriptions.find({users: Meteor.userId()}));

Meteor.publish("subscriptions.count", id => Subscriptions.find({_id: id}).count());
