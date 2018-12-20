import { assert } from "chai";
import { Meteor } from "meteor/meteor";

import "./methods";
import { isModerator } from "./methods";

Meteor.userId = () => "test-user"; // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({
  _id: "test-user",
  name: "Test User",
  moderator: true,
});

Meteor.users.find = obj => ({
  fetch: () => [Meteor.users.findOne()],
  forEach: () => {},
});

Meteor.users.update = (sel, mod) => {
  // simulate how mongo does updates
  if (sel === Meteor.userId() || sel._id === Meteor.userId()) {
    let newObj = {};

    if (mod["$set"]) {
      Object.keys(mod["$set"]).forEach(i => {
        if (i.indexOf(".") !== -1) {
          // in case modifier is, for example, 'profile.name'
          let all = i.split(".");

          let curObj = mod["$set"][i];

          all.reverse().forEach((j, ind) => {
            // build the object bottom up
            if (ind === all.length - 1) {
              newObj[j] = _.extend(newObj[j] || {}, curObj);
            }

            curObj = {
              [j]: curObj,
            };
          });
        } else {
          newObj[i] = mod["$set"][i];
        }
      });
    }

    if (mod["$inc"]) {
      Object.keys(mod["$inc"]).forEach(i => {
        if (i.indexOf(".") !== -1) {
          // in case modifier is, for example, 'profile.name'
          let all = i.split(".");

          let curObj = mod["$inc"][i];

          all.reverse().forEach((j, ind) => {
            // build the object bottom up
            if (ind === all.length - 1) {
              newObj[j] = _.extend(newObj[j] || {}, curObj);
            }

            curObj = {
              [j]: curObj,
            };
          });
        } else {
          newObj[i] += mod["$inc"][i];
        }
      });
    }

    if (mod["$addToSet"] || mod["$push"]) {
      Object.keys(mod["$addToSet"] || mod["$push"]).forEach(i => {
        if (i.indexOf(".") !== -1) {
          let all = i.split(".");

          let curObj = [(mod["$addToSet"] || mod["$push"])[i]];

          all.reverse().forEach((j, ind) => {
            // build the object bottom up
            if (ind === all.length - 1) {
              newObj[j] = _.extend(newObj[j] || {}, curObj);
            }

            curObj = {
              [j]: curObj,
            };
          });
        } else {
          newObj[i] = [(mod["$addToSet"] || mod["$push"])[i]];
        }
      });
    }

    if (mod["$pull"]) {
      Object.keys(mod["$pull"]).forEach(i => {
        if (i.indexOf(".") !== -1) {
          // in case modifier is, for example, 'profile.name'
          let all = i.split(".");

          let curObj = [];

          all.reverse().forEach((j, ind) => {
            // build the object bottom up
            if (ind === all.length - 1) {
              newObj[j] = _.extend(newObj[j] || {}, curObj);
            }

            curObj = {
              [j]: curObj,
            };
          });
        } else {
          newObj[i] = [];
        }
      });
    }

    // hacky solution that seems to work properly here, basically, the main problem is reference sharing between multiple js files and this seems to solve it
    let old = Meteor.users.findOne() || {};
    Meteor.users.findOne = () => _.extend(old, newObj);
  }
};

describe("User methods", () => {
  it("isModerator check works", () => {
    assert.ok(isModerator(Meteor.userId()));

    Meteor.users.update(
      {
        _id: Meteor.userId(),
      },
      {
        $set: {
          moderator: false,
        },
      }
    );

    assert.notOk(isModerator(Meteor.userId()));
  });
});
