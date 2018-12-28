import { Meteor } from "meteor/meteor";

Meteor.publish(null, () =>
  Meteor.users.find(
    {
      _id: Meteor.userId(),
    },
    {
      fields: {
        _id: 1,
        moderator: 1,
        name: 1,
        language: 1,
        emails: 1,
      },
    }
  )
);

Meteor.publish("users", () =>
  Meteor.users.find(
    {},
    {
      fields: {
        _id: 1,
        moderator: 1,
        name: 1,
        language: 1,
        emails: 1,
      },
    }
  )
);
