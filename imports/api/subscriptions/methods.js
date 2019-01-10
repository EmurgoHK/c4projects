import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Subscriptions } from "./subscriptions";

export const subscribe = new ValidatedMethod({
  name: "subscribe",
  validate: new SimpleSchema({
    articleId: {
      type: String,
      max: 90,
      optional: false,
    }
  }).validator({
    clean: true,
  }),
  run({articleId}) {
    if (Meteor.isServer) {
      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      Subscriptions.upsert({_id: articleId}, { $addToSet: {users: Meteor.userId()}})
    }
  },
});

export const unsubscribe = new ValidatedMethod({
  name: "unsubscribe",
  validate: new SimpleSchema({
    articleId: {
      type: String,
      max: 90,
      optional: false,
    }
  }).validator({
    clean: true,
  }),
  run({articleId}) {
    if (Meteor.isServer) {
      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      Subscriptions.upsert({_id: articleId}, { $pull: {users: Meteor.userId()}})
    }
  },
});