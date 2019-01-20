import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { userProfileSchema } from './userProfile';

export function isModerator(userId) {
  let user = Meteor.users.findOne({
    _id: userId,
  });

  return user && user.moderator;
}

export const promoteUser = new ValidatedMethod({
  name: "promoteUser",
  validate: new SimpleSchema({
    userId: {
      type: String,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ userId }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "You have to be logged in.");
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error("Error.", "You have to be a moderator.");
    }

    let user = Meteor.users.findOne({
      _id: userId,
    });

    if (!user) {
      throw new Meteor.Error("Error.", "Invalid user.");
    }

    Meteor.users.update(
      {
        _id: user._id,
      },
      {
        $set: {
          "mod.approved": true,
          "mod.time": new Date().getTime(),
          moderator: true,
        },
      }
    );
  },
});

if (Meteor.isDevelopment) {
  Meteor.methods({
    generateTestUser: () => {
      let user = Meteor.users.findOne({
        username: "testing",
      });
      if (!user) {
        try {
          let uId = Accounts.createUser({
            username: "testing",
            password: "testing",
            email: "testing@testing.test",
            name: "Tester",
          });

          Meteor.users.update(
            {
              _id: uId,
            },
            {
              $set: {
                moderator: true,
              },
            }
          );
        } catch (ex) {
          // This may have been because of concurrent user creation.
          let user = Meteor.users.findOne({
            username: "testing",
          });
          if (!user) throw ex;
        }
      }
    },
  });
}

export const editProfile = new ValidatedMethod({
  name : "editProfile",
  validate: userProfileSchema.validator({
    clean: true,
  }),
  run (data) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "You have to be logged in.");
    }
    Meteor.users.update(
      {
        _id: Meteor.userId(),
      },
      {
        $set: {
          userProfile : data,
        }
      },
    );
  }
})